<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Products;
use App\Models\Branch;
use App\Models\SalesOrder;
use App\Models\SalesVisit;
use App\Models\SalesPerson;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportService
{
    /**
     * Mendapatkan data lengkap laporan operasional (Sales, Products, & Stocks)
     */
    public function getReportsData(array $filters): array
    {
        $branchId = $filters['branch_id'] ?? 'ALL';
        
        // Default range: awal bulan ini s/d hari ini
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // 1. Mengambil Cabang untuk Dropdown Saringan
        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchesQuery->get();

        $tenantId = auth()->check() ? auth()->user()->tenant_id : 'guest';
        $page = (int) ($filters['page'] ?? 1);
        $perPage = (int) ($filters['per_page'] ?? 15);
        $cacheKey = "reports_data_{$tenantId}_{$branchId}_{$startDate}_{$endDate}_p{$page}_pp{$perPage}";

        return Cache::remember($cacheKey, now()->addMinutes(3), function () use ($filters, $branchId, $startDate, $endDate, $branches, $page, $perPage) {
            // ── A. LAPORAN PENJUALAN (SALES PERFORMANCE SUMMARY) ──────────────────
        $salesQuery = Transaction::where('status', 'paid')
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);

        if ($branchId !== 'ALL') {
            $salesQuery->where('branch_id', $branchId);
        }

        $totalSales = (float) $salesQuery->sum('total');
        $totalSubtotal = (float) $salesQuery->sum('subtotal');
        $totalDiscount = (float) $salesQuery->sum('discount');
        $totalTax = (float) $salesQuery->sum('tax');
        $transactionCount = $salesQuery->count();

        // Hitung Total HPP (Cost of Goods Sold)
        $cogsQuery = TransactionItem::whereHas('transaction', function ($q) use ($startDate, $endDate, $branchId) {
            $q->where('status', 'paid')
              ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        })->join('products', 'transaction_items.product_id', '=', 'products.id');

        $totalCogs = (float) $cogsQuery->sum(DB::raw('transaction_items.qty * products.base_cost'));
        $totalProfit = ($totalSubtotal - $totalDiscount) - $totalCogs;

        // Tren Penjualan Harian (Chart Data) - Perbandingan POS vs Canvas
        $dailyPosSales = $salesQuery->clone()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total_revenue'),
                DB::raw('COUNT(id) as tx_count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailyCanvasSales = SalesOrder::whereHas('salesVisit', function ($q) use ($startDate, $endDate, $branchId) {
                $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                if ($branchId !== 'ALL') {
                    $q->where('branch_id', $branchId);
                }
            })
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('COUNT(id) as tx_count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $periodRange = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1D'),
            (new \DateTime($endDate))->modify('+1 day')
        );

        $dailySales = [];
        foreach ($periodRange as $dateVal) {
            $d = $dateVal->format('Y-m-d');
            $posAmount = isset($dailyPosSales[$d]) ? (float) $dailyPosSales[$d]->total_revenue : 0.0;
            $posCount = isset($dailyPosSales[$d]) ? (int) $dailyPosSales[$d]->tx_count : 0;
            $canvasAmount = isset($dailyCanvasSales[$d]) ? (float) $dailyCanvasSales[$d]->total_revenue : 0.0;
            $canvasCount = isset($dailyCanvasSales[$d]) ? (int) $dailyCanvasSales[$d]->tx_count : 0;
            
            if ($posAmount > 0 || $canvasAmount > 0) {
                $dailySales[] = [
                    'date' => $d,
                    'pos_revenue' => $posAmount,
                    'canvas_revenue' => $canvasAmount,
                    'total_revenue' => $posAmount + $canvasAmount,
                    'tx_count' => $posCount + $canvasCount
                ];
            }
        }
        
        // Paginasi untuk array dailySales
        $page = (int) ($filters['page'] ?? 1);
        $perPage = (int) ($filters['per_page'] ?? 15);
        $collection = collect(array_reverse($dailySales)); // Urutan terbaru di atas
        $paginatedDailySales = new LengthAwarePaginator(
            $collection->forPage($page, $perPage)->values(),
            $collection->count(),
            $perPage,
            $page,
            ['path' => url()->current(), 'query' => request()->query()]
        );

        // Persentase Kontribusi Metode Pembayaran
        $paymentMethods = $salesQuery->clone()
            ->select('payment_method', DB::raw('SUM(total) as total_amount'), DB::raw('COUNT(id) as count'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                $methodLabel = match ($item->payment_method) {
                    'cash' => 'Uang Tunai (Cash)',
                    'transfer' => 'Transfer Bank / QRIS',
                    'debt' => 'Piutang Pelanggan',
                    default => $item->payment_method
                };
                return [
                    'label' => $methodLabel,
                    'amount' => (float) $item->total_amount,
                    'count' => $item->count
                ];
            });

        // Top Employees (Kasir Ter-Rajin)
        $topEmployees = $salesQuery->clone()
            ->select('created_by', DB::raw('SUM(total) as total_revenue'), DB::raw('COUNT(id) as tx_count'))
            ->with(['creator:id,name'])
            ->groupBy('created_by')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->created_by,
                    'name' => $item->creator->name ?? 'Kasir Dihapus',
                    'tx_count' => (int) $item->tx_count,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        // ── B. LAPORAN PERFORMA PRODUK (PRODUCT SALES ANALYSIS) ───────────────
        $itemsQuery = TransactionItem::whereHas('transaction', function ($q) use ($startDate, $endDate, $branchId) {
            $q->where('status', 'paid')
              ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        });

        // 10 Produk Terlaris & Estimasi Keuntungan Bersih
        $topProducts = $itemsQuery->clone()
            ->select('product_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->with(['product:id,name,sku,base_cost'])
            ->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $cost = (float) ($item->product->base_cost ?? 0);
                $revenue = (float) $item->total_revenue;
                $qty = (int) $item->total_qty;
                $profit = $revenue - ($cost * $qty);

                return [
                    'name' => $item->product->name ?? 'Produk Terhapus',
                    'sku' => $item->product->sku ?? '-',
                    'qty_sold' => $qty,
                    'revenue' => $revenue,
                    'profit' => $profit
                ];
            });

        // ── C. LAPORAN STOK & INVENTORI (VALUATION & STOCK ALERTS) ────────────
        // Agregasi Subquery Stock Movements agar kompatibel dengan PostgreSQL & MySQL
        $subqueryStock = DB::table('stock_movements')
            ->select('product_id', DB::raw("SUM(CASE WHEN type IN ('IN', 'RETURN') THEN qty WHEN type = 'OUT' THEN -qty WHEN type = 'ADJUST' THEN qty ELSE 0 END) as current_stock"))
            ->groupBy('product_id');

        $totalProductsCount = Products::count();

        // 1. Hitung Jumlah Stok Habis (Out of Stock)
        $outOfStockCount = DB::table('products')
            ->leftJoinSub($subqueryStock, 'sm', 'products.id', '=', 'sm.product_id')
            ->where(function ($q) {
                if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                    $q->where('products.tenant_id', auth()->user()->tenant_id);
                }
            })
            ->where(DB::raw('COALESCE(sm.current_stock, 0)'), '<=', 0)
            ->count();

        // 2. Hitung Jumlah Stok Menipis (<= 5 Pcs)
        $lowStockCount = DB::table('products')
            ->leftJoinSub($subqueryStock, 'sm', 'products.id', '=', 'sm.product_id')
            ->where(function ($q) {
                if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                    $q->where('products.tenant_id', auth()->user()->tenant_id);
                }
            })
            ->where('products.track_stock', true)
            ->where(DB::raw('COALESCE(sm.current_stock, 0)'), '>', 0)
            ->where(DB::raw('COALESCE(sm.current_stock, 0)'), '<=', 5)
            ->count();

        // 3. Valuasi Nilai Aset Stok Terkini (Harga Modal vs Nilai Jual)
        $stockValuation = DB::table('products')
            ->leftJoinSub($subqueryStock, 'sm', 'products.id', '=', 'sm.product_id')
            ->where(function ($q) {
                if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                    $q->where('products.tenant_id', auth()->user()->tenant_id);
                }
            })
            ->select(
                DB::raw('SUM(COALESCE(sm.current_stock, 0) * products.sell_price) as retail_value'),
                DB::raw('SUM(COALESCE(sm.current_stock, 0) * products.base_cost) as cost_value')
            )
            ->first();

        // 4. Daftar 15 Produk Stok Kritis (Restock Alert)
        // Menggunakan WHERE pada kolom gabungan sm.current_stock untuk menghindari PostgreSQL grouping error
        $lowStockItems = Products::withCurrentStock()
            ->where('products.track_stock', true)
            ->where(DB::raw('COALESCE(sm.current_stock, 0)'), '<=', 5)
            ->orderBy('current_stock', 'asc')
            ->limit(15)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'stock' => (int) $p->current_stock,
                    'price' => (float) $p->sell_price,
                    'base_cost' => (float) $p->base_cost,
                ];
            });

        // ── D. LAPORAN SALES LAPANGAN (FIELD SALES REPORT) ───────────────────
        $visitsQuery = SalesVisit::whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        if ($branchId !== 'ALL') {
            $visitsQuery->where('branch_id', $branchId);
        }

        $totalVisits = $visitsQuery->count();

        $ordersQuery = SalesOrder::whereHas('salesVisit', function ($q) use ($startDate, $endDate, $branchId) {
            $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        });

        $totalOrdersCount = $ordersQuery->count();
        $totalOrdersRevenue = (float) $ordersQuery->sum('total_amount');

        // Sales Leaderboard (Kinerja Sales Reps)
        $salesFieldLeaderboard = SalesPerson::orderBy('name')
            ->get()
            ->map(function ($s) use ($startDate, $endDate) {
                $visits = SalesVisit::where('sales_id', $s->id)
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->count();

                $orders = SalesOrder::whereHas('salesVisit', function ($q) use ($s, $startDate, $endDate) {
                    $q->where('sales_id', $s->id)
                      ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                });

                return [
                    'id' => $s->id,
                    'name'          => $s->name,
                    'branch'        => $s->branch?->name ?? '-',
                    'visits_count'  => $visits,
                    'orders_count'  => $orders->count(),
                    'total_revenue' => (float) $orders->sum('total_amount'),
                    'conversion_rate' => $visits > 0 ? round($orders->count() / $visits * 100, 1) : 0,
                ];
            })
            ->sortByDesc('total_revenue')
            ->values()
            ->all();

        $orderedVisits = (clone $visitsQuery)->where('status', 'ordered')->count();

        // ── E. LAPORAN ABSENSI (ATTENDANCE REPORT) ──────────────────────────────
        $todayStr = Carbon::today()->toDateString();
        $attendanceQuery = Attendance::whereDate('date', $todayStr);
        if ($branchId !== 'ALL') {
            $attendanceQuery->where('branch_id', $branchId);
        }
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $attendanceQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        $attendanceReport = null;
        $user = auth()->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        $currentBranch = $user ? \App\Models\Branch::find($user->branch_id) : null;
        
        $showAttendance = $isSuperAdmin || ($currentBranch && ($currentBranch->pos_settings['enable_attendance'] ?? false));

        if ($showAttendance) {
            $attendanceReport = [
                'present' => (clone $attendanceQuery)->where('status', 'present')->count(),
                'late'    => (clone $attendanceQuery)->where('status', 'late')->count(),
                'sick'    => (clone $attendanceQuery)->where('status', 'sick')->count(),
                'leave'   => (clone $attendanceQuery)->where('status', 'leave')->count(),
                'absent'  => (clone $attendanceQuery)->where('status', 'absent')->count(),
            ];
        }

        return [
            'branches'  => $branches,
            'filters'   => [
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'branch_id'  => $branchId,
            ],
            'salesSummary' => [
                'total_sales'    => $totalSales,
                'total_subtotal' => $totalSubtotal,
                'total_discount' => $totalDiscount,
                'total_tax'      => $totalTax,
                'total_cogs'     => $totalCogs,
                'total_profit'   => $totalProfit,
                'tx_count'       => $transactionCount,
                'daily_sales'    => $paginatedDailySales,
                'all_daily_sales'=> array_reverse($dailySales), // Untuk export non-paginasi
                'payment_methods' => $paymentMethods,
                'top_employees'  => $topEmployees,
            ],
            'productPerformance' => [
                'top_products' => $topProducts,
            ],
            'stockReport' => [
                'total_items'      => $totalProductsCount,
                'out_of_stock'     => $outOfStockCount,
                'low_stock'        => $lowStockCount,
                'retail_valuation' => (float) ($stockValuation->retail_value ?? 0),
                'cost_valuation'   => (float) ($stockValuation->cost_value ?? 0),
                'low_stock_items'  => $lowStockItems,
            ],
            'salesFieldReport' => [
                'total_visits'    => $totalVisits,
                'ordered_visits'  => $orderedVisits,
                'total_orders'    => $totalOrdersCount,
                'total_revenue'   => $totalOrdersRevenue,
                'conversion_rate' => $totalVisits > 0 ? round($orderedVisits / $totalVisits * 100, 1) : 0,
                'leaderboard'     => $salesFieldLeaderboard,
            ],
            'attendanceReport' => $attendanceReport,
        ];
        });
    }

    /**
     * Data untuk Dashboard Sales Lapangan.
     * Terpisah dari getReportsData agar tanggung jawab tetap tunggal.
     */
    public function getSalesDashboardData(array $filters): array
    {
        $branchId = $filters['branch_id'] ?? 'ALL';
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate   = $filters['end_date']   ?? now()->toDateString();

        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchesQuery->get();

        $tenantId = auth()->check() ? auth()->user()->tenant_id : 'guest';
        $cacheKey = "sales_dashboard_{$tenantId}_{$branchId}_{$startDate}_{$endDate}";

        return Cache::remember($cacheKey, now()->addMinutes(3), function () use ($branchId, $startDate, $endDate, $branches) {
        // KPI: total kunjungan, orders, & omset canvas periode ini
        $visitsQuery = SalesVisit::whereBetween('created_at', [
            $startDate . ' 00:00:00', $endDate . ' 23:59:59'
        ]);
        if ($branchId !== 'ALL') {
            $visitsQuery->where('branch_id', $branchId);
        }
        $totalVisits  = $visitsQuery->count();
        $orderedVisits = (clone $visitsQuery)->where('status', 'ordered')->count();
        $conversionRate = $totalVisits > 0 ? round($orderedVisits / $totalVisits * 100, 1) : 0;

        $ordersQuery = SalesOrder::whereHas('salesVisit', function ($q) use ($startDate, $endDate, $branchId) {
            $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        });
        $totalOrdersRevenue = (float) $ordersQuery->sum('total_amount');
        $totalOrdersCount   = $ordersQuery->count();

        // Tren kunjungan harian (chart)
        $dailyVisits = $visitsQuery->clone()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as visits'),
                DB::raw('SUM(CASE WHEN status = \'ordered\' THEN 1 ELSE 0 END) as orders')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Leaderboard dengan konversi rate
        $leaderboard = SalesPerson::orderBy('name')->get()
            ->map(function ($s) use ($startDate, $endDate) {
                $visits = SalesVisit::where('sales_id', $s->id)
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->count();

                $orders = SalesOrder::whereHas('salesVisit', function ($q) use ($s, $startDate, $endDate) {
                    $q->where('sales_id', $s->id)
                      ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                });

                $ordersCount   = $orders->count();
                $totalRevenue  = (float) $orders->sum('total_amount');
                $conversion    = $visits > 0 ? round($ordersCount / $visits * 100, 1) : 0;

                return [
                    'id'              => $s->id,
                    'name'            => $s->name,
                    'branch'          => $s->branch?->name ?? '-',
                    'visits_count'    => $visits,
                    'orders_count'    => $ordersCount,
                    'total_revenue'   => $totalRevenue,
                    'conversion_rate' => $conversion,
                ];
            })
            ->sortByDesc('total_revenue')
            ->values()
            ->all();

        return [
            'branches' => $branches,
            'filters'  => compact('startDate', 'endDate', 'branchId'),
            'kpi' => [
                'total_visits'    => $totalVisits,
                'ordered_visits'  => $orderedVisits,
                'total_orders'    => $totalOrdersCount,
                'total_revenue'   => $totalOrdersRevenue,
                'conversion_rate' => $conversionRate,
            ],
            'daily_visits' => $dailyVisits,
            'leaderboard'  => $leaderboard,
        ];
        });
    }
}

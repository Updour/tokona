<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Products;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;

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
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchesQuery->get();

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

        // Tren Penjualan Harian (Chart Data)
        $dailySales = $salesQuery->clone()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total_revenue'),
                DB::raw('COUNT(id) as tx_count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

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

        return [
            'branches' => $branches,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
            ],
            'salesSummary' => [
                'total_sales' => $totalSales,
                'total_subtotal' => $totalSubtotal,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'tx_count' => $transactionCount,
                'daily_sales' => $dailySales,
                'payment_methods' => $paymentMethods,
            ],
            'productPerformance' => [
                'top_products' => $topProducts,
            ],
            'stockReport' => [
                'total_items' => $totalProductsCount,
                'out_of_stock' => $outOfStockCount,
                'low_stock' => $lowStockCount,
                'retail_valuation' => (float) ($stockValuation->retail_value ?? 0),
                'cost_valuation' => (float) ($stockValuation->cost_value ?? 0),
                'low_stock_items' => $lowStockItems,
            ]
        ];
    }
}

<?php

namespace App\Services;

use App\Models\SalesPerson;
use App\Models\SalesVisit;
use App\Models\SalesLoadedStock;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\Products;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\User;
use App\Models\Tenants;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Exception;

class SalesService
{
    /**
     * Mengambil daftar sales representative terfilter.
     */
    public function getSalesListData(array $filters)
    {
        $query = SalesPerson::filter($filters)->with(['branch', 'loadedStocks.product']);

        // Jika user bukan super admin, batasi berdasarkan tenant
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        $sales = $query->paginate($filters['per_page'] ?? 15);

        // Tambah hitungan statistik kunjungan & order dinamis
        foreach ($sales as $s) {
            $s->visits_count = SalesVisit::where('sales_id', $s->id)->count();
            $s->orders_count = SalesOrder::whereHas('salesVisit', function ($q) use ($s) {
                $q->where('sales_id', $s->id);
            })->count();
        }

        // Ambil data cabang untuk dropdown modal tambah sales
        $branchQuery = Branch::orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $branchQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchQuery->get();

        // Ambil produk untuk dropdown muat stok canvas
        $productQuery = Products::withCurrentStock()->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $productQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $products = $productQuery->get();

        return [
            'sales' => $sales,
            'branches' => $branches,
            'products' => $products,
            'stats' => [
                'total_sales' => $query->count(),
                'total_visits' => SalesVisit::count(),
                'total_orders' => SalesOrder::count(),
            ],
            'filters' => $filters,
        ];
    }

    /**
     * Menyimpan data sales representative baru.
     */
    public function storeSalesPerson(array $data)
    {
        return DB::transaction(function () use ($data) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $data['tenant_id'] = auth()->user()->tenant_id;
            } else {
                // Jika super admin, gunakan tenant dari branch yang dipilih
                $branch = Branch::findOrFail($data['branch_id']);
                $data['tenant_id'] = $branch->tenant_id;
            }

            $data['id'] = Str::uuid()->toString();
            $data['is_active'] = true;

            $salesPerson = SalesPerson::create($data);

            // Otomatis buatkan User untuk login Sales
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'id' => Str::uuid()->toString(),
                    'tenant_id' => $data['tenant_id'],
                    'branch_id' => $data['branch_id'],
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ]
            );

            // Pastikan dia punya role 'sales'
            $role = Role::where('name', 'sales')->first();
            if ($role && !$user->roles()->where('role_id', $role->id)->exists()) {
                $user->roles()->attach($role->id);
            }

            return $salesPerson;
        });
    }

    /**
     * Mengambil data log kunjungan harian lapangan.
     */
    public function getVisitsListData(array $filters)
    {
        $query = SalesVisit::with(['salesPerson', 'customer', 'branch', 'salesOrder.items.product']);

        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        // Filter by Sales Person
        if (!empty($filters['sales_id']) && $filters['sales_id'] !== 'ALL') {
            $query->where('sales_id', $filters['sales_id']);
        }

        // Filter by Date Range
        if (!empty($filters['start_date'])) {
            $query->whereDate('visited_at', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('visited_at', '<=', $filters['end_date']);
        }

        // Filter by Search (Sales or Customer Name)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('salesPerson', function($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                })->orWhereHas('customer', function($cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%");
                });
            });
        }

        $visits = $query->orderByDesc('visited_at')->paginate($filters['per_page'] ?? 15);

        // Fetch sales persons for filter dropdown
        $salesPersonsQuery = SalesPerson::orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $salesPersonsQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $salesPersons = $salesPersonsQuery->get();

        return [
            'visits' => $visits,
            'salesPersons' => $salesPersons,
            'filters' => $filters,
        ];
    }

    /**
     * Mengambil peta lokasi toko & sebaran koordinat sales.
     */
    public function getMapData(array $filters)
    {
        $customerQuery = Customer::whereNotNull('latitude')->whereNotNull('longitude');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $customerQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $locations = $customerQuery->get();

        $activeVisitsQuery = SalesVisit::with(['salesPerson', 'customer'])->latest('visited_at');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $activeVisitsQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $activeVisits = $activeVisitsQuery->take(10)->get();

        return [
            'locations' => $locations,
            'activeVisits' => $activeVisits,
            'filters' => $filters,
        ];
    }

    public function recordSalesVisit(string $salesPersonId, array $data)
    {
        // Enforce tenant ID for isolation
        $tenantId = null;
        if (auth()->check() && auth()->user()->tenant_id) {
            $tenantId = auth()->user()->tenant_id;
        } else {
            $salesPerson = SalesPerson::find($salesPersonId);
            $tenantId = $salesPerson ? $salesPerson->tenant_id : (Tenants::first()->id ?? Str::uuid());
        }

        // 1. Geofencing Validation (Radius 50 meter)
        if (!empty($data['customer_id']) && !empty($data['latitude']) && !empty($data['longitude'])) {
            $customer = Customer::find($data['customer_id']);
            if ($customer) {
                if ($customer->latitude && $customer->longitude) {
                    $distance = $this->calculateDistance(
                        $data['latitude'], $data['longitude'],
                        $customer->latitude, $customer->longitude
                    );

                    if ($distance > 50) {
                        throw new Exception("Check-In ditolak. Anda berada di luar radius toko (Jarak dari titik: " . round($distance) . " meter).");
                    }
                } else {
                    // Simpan koordinat check-in pertama ini sebagai patokan titik toko
                    $customer->update([
                        'latitude' => $data['latitude'],
                        'longitude' => $data['longitude'],
                    ]);
                }
            }
        }

        // 2. Upload Photo (Proof of Visit)
        $photoUrl = $data['photo_url'] ?? null;
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $path = $data['photo']->store('canvas_visits', 'public');
            $photoUrl = Storage::url($path);
        }

        $visit = SalesVisit::create([
            'id' => Str::uuid()->toString(),
            'tenant_id' => $tenantId,
            'sales_id' => $salesPersonId,
            'branch_id' => $data['branch_id'] ?? null,
            'customer_id' => $data['customer_id'] ?? null,
            'status' => $data['status'] ?? 'visit',
            'visited_at' => $data['visited_at'] ?? now(),
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'address_text' => $data['address_text'] ?? null,
            'photo_url' => $photoUrl,
            'notes' => $data['notes'] ?? null,
        ]);
        
        return $visit;
    }

    /**
     * Menghitung jarak antara 2 titik koordinat (dalam satuan meter) menggunakan Haversine Formula.
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Radius bumi dalam meter
        
        $lat1 = deg2rad((float) $lat1);
        $lon1 = deg2rad((float) $lon1);
        $lat2 = deg2rad((float) $lat2);
        $lon2 = deg2rad((float) $lon2);

        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos($lat1) * cos($lat2) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Allocates stock from branch warehouse to salesperson mobile stock (loading canvas goods).
     */
    public function loadStockToSales(string $salesPersonId, string $productId, int $qty)
    {
        return DB::transaction(function () use ($salesPersonId, $productId, $qty) {
            $sales = SalesPerson::findOrFail($salesPersonId);
            $product = Products::withCurrentStock()->findOrFail($productId);

            // Cek ketersediaan stok di cabang utama
            $currentStock = (int) ($product->current_stock ?? 0);
            if ($product->track_stock && $currentStock < $qty) {
                throw new Exception("Stok produk '{$product->name}' di cabang tidak mencukupi (Tersedia: {$currentStock}).");
            }

            // Kurangi stok utama cabang/toko dengan mencatat pergerakan stok 'OUT'
            if ($product->track_stock) {
                $product->recordStockMovement('OUT', $qty, [
                    'source_type' => 'sales',
                    'description' => "Dimuat ke kendaraan sales: {$sales->name}",
                ]);
            }

            // Tambahkan ke loaded stock sales
            $loadedStock = SalesLoadedStock::firstOrNew([
                'sales_person_id' => $salesPersonId,
                'product_id' => $productId,
            ]);

            $loadedStock->allocated_qty += $qty;
            $loadedStock->current_stock += $qty;
            $loadedStock->save();

            return $loadedStock;
        });
    }

    /**
     * Menarik kembali sisa stok dari kendaraan sales ke gudang cabang utama (Unloading Canvas).
     */
    public function unloadStockFromSales(string $salesPersonId)
    {
        return DB::transaction(function () use ($salesPersonId) {
            $sales = SalesPerson::findOrFail($salesPersonId);

            // Cari semua sisa stok di kendaraan sales yang > 0
            $loadedStocks = SalesLoadedStock::where('sales_person_id', $salesPersonId)
                ->where('current_stock', '>', 0)
                ->get();

            $totalUnloaded = 0;

            foreach ($loadedStocks as $loaded) {
                $qtyToReturn = $loaded->current_stock;
                
                // Tambahkan kembali stok utama cabang/toko
                $product = Products::find($loaded->product_id);
                if ($product && $product->track_stock) {
                    $product->recordStockMovement('IN', $qtyToReturn, [
                        'source_type' => 'sales_return',
                        'description' => "Retur / Unloading dari kendaraan sales: {$sales->name}",
                    ]);
                }

                // Nol-kan sisa stok di kendaraan
                $loaded->current_stock = 0;
                $loaded->save();

                $totalUnloaded += $qtyToReturn;
            }

            return $totalUnloaded;
        });
    }

    /**
     * Mencatat penjualan pesanan toko mitra di lapangan & memotong stok canvas sales.
     */
    public function recordSalesOrder(string $visitId, array $items, string $paymentMethod = 'cash')
    {
        return DB::transaction(function () use ($visitId, $items, $paymentMethod) {
            $visit = SalesVisit::findOrFail($visitId);
            $salesPerson = SalesPerson::findOrFail($visit->sales_id);

            $totalAmount = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $qty = $item['qty'];
                $price = $item['price'];

                // Cek ketersediaan stok canvas di kendaraan sales
                $loadedStock = SalesLoadedStock::where('sales_person_id', $salesPerson->id)
                    ->where('product_id', $productId)
                    ->first();

                if (!$loadedStock || $loadedStock->current_stock < $qty) {
                    $prodName = Products::find($productId)?->name ?? 'Produk';
                    throw new Exception("Stok canvas sales untuk '{$prodName}' tidak mencukupi untuk disetorkan (Sisa: " . ($loadedStock?->current_stock ?? 0) . ").");
                }

                // Potong stok canvas sales
                $loadedStock->decrement('current_stock', $qty);
                $loadedStock->increment('sold_qty', $qty);

                $subtotal = $qty * $price;
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'id' => Str::uuid()->toString(),
                    'product_id' => $productId,
                    'qty' => $qty,
                    'price' => $price,
                    'subtotal' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Simpan Sales Order
            $order = SalesOrder::create([
                'id' => Str::uuid()->toString(),
                'sales_visit_id' => $visitId,
                'total_amount' => $totalAmount,
                'payment_status' => $paymentMethod === 'cash' ? 'paid' : 'unpaid',
                'payment_method' => $paymentMethod,
            ]);

            // Simpan Item Pesanan
            foreach ($orderItems as &$orderItem) {
                $orderItem['sales_order_id'] = $order->id;
                SalesOrderItem::create($orderItem);
            }

            // Update status kunjungan menjadi ordered
            $visit->update(['status' => 'ordered']);

            return $order;
        });
    }

    /**
     * Memperbarui data sales representative.
     */
    public function updateSalesPerson(string $id, array $data)
    {
        $sales = SalesPerson::findOrFail($id);

        // Enforce tenant isolation
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            if ($sales->tenant_id !== auth()->user()->tenant_id) {
                throw new Exception("Akses ditolak untuk mengubah data tenant lain.");
            }
        }

        $sales->update($data);
        return $sales;
    }

    /**
     * Menghapus sales representative secara aman beserta muatan stok & kunjungannya.
     */
    public function deleteSalesPerson(string $id)
    {
        return DB::transaction(function () use ($id) {
            $sales = SalesPerson::findOrFail($id);

            // Enforce tenant isolation
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                if ($sales->tenant_id !== auth()->user()->tenant_id) {
                    throw new Exception("Akses ditolak untuk menghapus data tenant lain.");
                }
            }

            // Hapus muatan stok
            SalesLoadedStock::where('sales_person_id', $id)->delete();

            // Hapus kunjungan & pesanan terkait jika ada
            $visits = SalesVisit::where('sales_id', $id)->get();
            foreach ($visits as $visit) {
                $orders = SalesOrder::where('sales_visit_id', $visit->id)->get();
                foreach ($orders as $order) {
                    SalesOrderItem::where('sales_order_id', $order->id)->delete();
                    $order->delete();
                }
                $visit->delete();
            }

            $sales->delete();
            return true;
        });
    }
}

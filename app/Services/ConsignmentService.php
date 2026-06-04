<?php

namespace App\Services;

use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\Products;
use App\Models\Supplier;
use App\Models\Branch;
use App\Models\CashBook;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConsignmentService
{
    /**
     * Mengambil daftar sesi titipan.
     */
    public function getListData(array $filters)
    {
        $query = Consignment::with(['supplier', 'branch', 'items.product'])->latest();

        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'ALL') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['supplier_id']) && $filters['supplier_id'] !== 'ALL') {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('supplier', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('consignment_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('consignment_date', '<=', $filters['date_to']);
        }

        $consignments = $query->paginate($filters['per_page'] ?? 15);

        $suppliersQuery = Supplier::orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $suppliersQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        
        $branchesQuery = Branch::orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        $productsQuery = Products::withCurrentStock()->where('is_active', true);
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $productsQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'consignments' => $consignments,
            'suppliers' => $suppliersQuery->get(),
            'branches' => $branchesQuery->get(),
            'products' => $productsQuery->get(),
            'filters' => $filters,
        ];
    }

    /**
     * Mencatat penerimaan barang titipan dari supplier.
     */
    public function receiveConsignment(array $data)
    {
        return DB::transaction(function () use ($data) {
            $tenantId = auth()->check() ? auth()->user()->tenant_id : null;
            if (!$tenantId) {
                $branch = Branch::find($data['branch_id']);
                $tenantId = $branch ? $branch->tenant_id : (\App\Models\Tenants::first()->id ?? Str::uuid());
            }

            $consignment = Consignment::create([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $tenantId,
                'branch_id' => $data['branch_id'],
                'supplier_id' => $data['supplier_id'],
                'status' => 'active',
                'consignment_date' => $data['consignment_date'] ?? now()->format('Y-m-d'),
                'due_date' => $data['due_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = Products::find($item['product_id']);
                if (!$product) continue;

                // Tandai produk sebagai barang titipan (source = consignment) jika belum
                if ($product->source !== 'consignment') {
                    $product->update(['source' => 'consignment']);
                }

                $subtotal = $item['qty'] * $item['base_cost'];

                ConsignmentItem::create([
                    'id' => Str::uuid()->toString(),
                    'consignment_id' => $consignment->id,
                    'product_id' => $item['product_id'],
                    'qty_received' => $item['qty'],
                    'qty_unsold' => 0,
                    'qty_sold' => 0,
                    'base_cost' => $item['base_cost'],
                    'subtotal' => $subtotal,
                ]);

                // Tambahkan stok toko (IN)
                if ($product->track_stock) {
                    $product->recordStockMovement('IN', $item['qty'], [
                        'source_type' => 'consignment_receive',
                        'description' => "Penerimaan titipan dari supplier",
                    ]);
                }
            }

            return $consignment;
        });
    }

    /**
     * Setoran titipan (Hitung sisa fisik, laku, dan tagihan).
     */
    public function settleConsignment(string $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $consignment = Consignment::with('items.product')->findOrFail($id);

            if ($consignment->status === 'settled') {
                throw new \Exception("Sesi titipan ini sudah disetor/diselesaikan.");
            }

            $totalPaid = 0;
            $totalDiscount = $data['total_discount'] ?? 0;
            $action = $data['unsold_action'] ?? 'rollover'; // 'rollover' or 'return'

            // Mapping input dari frontend
            $itemUpdates = collect($data['items'] ?? [])->keyBy('item_id');

            foreach ($consignment->items as $cItem) {
                if ($itemUpdates->has($cItem->id)) {
                    $input = $itemUpdates->get($cItem->id);
                    $qtyUnsold = (int)$input['qty_unsold'];

                    // Laku = Diterima - Sisa Fisik
                    $qtySold = max(0, $cItem->qty_received - $qtyUnsold);
                    $subtotal = $qtySold * $cItem->base_cost;

                    $cItem->update([
                        'qty_unsold' => $qtyUnsold,
                        'qty_sold' => $qtySold,
                        'subtotal' => $subtotal,
                    ]);

                    $totalPaid += $subtotal;

                    // Tangani sisa barang
                    if ($qtyUnsold > 0 && $action === 'return') {
                        // Tarik/Retur: kurangi sisa barang dari stok fisik toko (OUT/RETURN)
                        if ($cItem->product && $cItem->product->track_stock) {
                            $cItem->product->recordStockMovement('OUT', $qtyUnsold, [
                                'source_type' => 'consignment_return',
                                'description' => "Retur sisa titipan ke supplier",
                            ]);
                        }
                    } 
                    // Jika rollover, stok tidak diapa-apakan karena barang masih ada di rak.
                }
            }

            // Hitung net bayar
            $netPaid = max(0, $totalPaid - $totalDiscount);

            $consignment->update([
                'status' => 'settled',
                'settled_at' => now(),
                'total_paid' => $netPaid,
                'total_discount' => $totalDiscount,
            ]);

            // Jika Rollover, buat sesi titipan baru otomatis untuk sisa barang
            if ($action === 'rollover') {
                $rolloverItems = [];
                foreach ($consignment->items as $cItem) {
                    if ($cItem->qty_unsold > 0) {
                        $rolloverItems[] = $cItem;
                    }
                }

                if (count($rolloverItems) > 0) {
                    $newConsignment = Consignment::create([
                        'id' => Str::uuid()->toString(),
                        'tenant_id' => $consignment->tenant_id,
                        'branch_id' => $consignment->branch_id,
                        'supplier_id' => $consignment->supplier_id,
                        'status' => 'active',
                        'consignment_date' => now()->format('Y-m-d'),
                        'due_date' => now()->addDays(7)->format('Y-m-d'),
                        'notes' => 'Rollover dari sesi titipan sebelumnya (' . ($consignment->reference_number ?? substr($consignment->id, 0, 8)) . ')',
                    ]);

                    foreach ($rolloverItems as $item) {
                        ConsignmentItem::create([
                            'id' => Str::uuid()->toString(),
                            'consignment_id' => $newConsignment->id,
                            'product_id' => $item->product_id,
                            'qty_received' => $item->qty_unsold, // Sisa bulan lalu jadi qty terima bulan ini
                            'qty_unsold' => 0,
                            'qty_sold' => 0,
                            'base_cost' => $item->base_cost,
                            'subtotal' => $item->qty_unsold * $item->base_cost,
                        ]);
                        // CATATAN: Kita TIDAK memanggil recordStockMovement('IN') di sini
                        // karena barangnya secara fisik sudah ada di dalam toko (tidak pernah ditarik).
                    }
                }
            }

            // AKUNTANSI KEUANGAN: Otomatis potong uang kas
            if ($netPaid > 0) {
                CashBook::create([
                    'tenant_id' => $consignment->tenant_id,
                    'branch_id' => $consignment->branch_id,
                    'type' => 'out',
                    'category' => 'pembayaran_titipan',
                    'amount' => $netPaid,
                    'reference_type' => 'consignment',
                    'reference_id' => $consignment->id,
                    'note' => 'Setoran Barang Titipan ke Supplier: ' . ($consignment->supplier->name ?? 'Tanpa Nama'),
                    'created_by' => auth()->id() ?? $consignment->tenant_id,
                ]);
            }

            return $consignment;
        });
    }
}

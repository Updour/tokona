<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Products;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventoryService
{
    /**
     * Menyimpan hasil stock opname dan menyesuaikan stok secara otomatis.
     */
    public function recordOpname(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();

            // Simpan header stock opname
            $opname = StockOpname::create([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $user->tenant_id,
                'branch_id' => $user->branch_id ?? $data['branch_id'] ?? null, // Sesuaikan branch
                'created_by' => $user->id,
                'reference_number' => 'OPN-' . date('ymd') . '-' . strtoupper(Str::random(5)),
                'opname_date' => $data['opname_date'],
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
            ]);

            // Simpan detail item (Hanya menyimpan data, stok belum disesuaikan)
            foreach ($data['items'] as $item) {
                $product = Products::withCurrentStock()->findOrFail($item['product_id']);

                $systemStock = (int) ($product->current_stock ?? 0);
                $physicalStock = (int) $item['physical_stock'];
                $difference = $physicalStock - $systemStock;

                StockOpnameItem::create([
                    'id' => Str::uuid()->toString(),
                    'stock_opname_id' => $opname->id,
                    'product_id' => $product->id,
                    'system_stock' => $systemStock,
                    'physical_stock' => $physicalStock,
                    'difference' => $difference,
                    'reason' => $item['reason'] ?? null,
                ]);
            }

            return $opname;
        });
    }

    /**
     * Menyetujui hasil stock opname dan mengeksekusi penyesuaian stok.
     */
    public function approveOpname(string $opnameId)
    {
        return DB::transaction(function () use ($opnameId) {
            $opname = StockOpname::with('items.product')->findOrFail($opnameId);

            if ($opname->status !== 'draft') {
                throw new \Exception('Hanya opname berstatus draft yang bisa disetujui.');
            }

            // Eksekusi penyesuaian stok untuk tiap item
            foreach ($opname->items as $item) {
                $product = $item->product;
                if (!$product)
                    continue;

                // Ambil stok sistem terbaru saat di-approve (berjaga-jaga jika ada penjualan selagi draft)
                $currentSystemStock = (int) ($product->current_stock ?? 0);
                // Hitung ulang difference berdasarkan stok fisik (hitungan absolut) dan stok sistem terbaru
                $physicalStock = (int) $item->physical_stock;
                $difference = $physicalStock - $currentSystemStock;

                // Update item dengan selisih terbaru
                $item->update([
                    'system_stock' => $currentSystemStock,
                    'difference' => $difference,
                ]);

                // Sesuaikan stok dan catat pergerakan jika ada selisih
                if ($difference !== 0) {
                    $type = $difference > 0 ? 'IN' : 'OUT';
                    $qty = abs($difference);

                    $product->recordStockMovement($type, $qty, [
                        'source_type' => 'stock_opname',
                        'notes' => $item->reason ? "Opname {$opname->reference_number}: {$item->reason}" : "Penyesuaian Stock Opname ({$opname->reference_number})",
                    ]);

                    // JIKA DIFFERENCE < 0 (BARANG HILANG), CATAT SEBAGAI BEBAN
                    if ($difference < 0) {
                        $lossAmount = $qty * $product->base_cost;
                        if ($lossAmount > 0) {
                            Expense::create([
                                'tenant_id' => $opname->tenant_id,
                                'branch_id' => $opname->branch_id,
                                'title' => "Kehilangan Stok: {$product->name}",
                                'category' => 'Penyusutan Persediaan',
                                'amount' => $lossAmount,
                                'expense_date' => $opname->opname_date,
                                'note' => "Kehilangan {$qty} unit berdasarkan Stock Opname {$opname->reference_number}. Harga modal: " . number_format($product->base_cost, 0, ',', '.'),
                            ]);
                        }
                    }
                }
            }

            $opname->update(['status' => 'completed']);

            return $opname;
        });
    }

    /**
     * Membatalkan stock opname draft.
     */
    public function cancelOpname(string $opnameId, string $reason)
    {
        return DB::transaction(function () use ($opnameId, $reason) {
            $opname = StockOpname::findOrFail($opnameId);

            if ($opname->status !== 'draft') {
                throw new \Exception('Hanya opname berstatus draft yang bisa dibatalkan.');
            }

            $opname->update([
                'status' => 'cancelled',
                'cancel_reason' => $reason
            ]);

            return $opname;
        });
    }

    /**
     * Menarik riwayat stock opname
     */
    public function getOpnameHistory(array $filters = [])
    {
        $query = StockOpname::with(['creator', 'items.product'])->latest('created_at');

        // Optional filters
        if (!empty($filters['start_date'])) {
            $query->whereDate('opname_date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('opname_date', '<=', $filters['end_date']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }
}

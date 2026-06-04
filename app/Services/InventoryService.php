<?php

namespace App\Services;

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
                'reference_number' => 'OPN-' . strtoupper(Str::random(8)),
                'opname_date' => $data['opname_date'],
                'notes' => $data['notes'] ?? null,
                'status' => 'completed',
            ]);

            // Simpan detail item dan sesuaikan stok produk
            foreach ($data['items'] as $item) {
                $product = Products::withCurrentStock()->findOrFail($item['product_id']);
                
                $systemStock = (int) ($product->current_stock ?? 0);
                $physicalStock = (int) $item['physical_stock'];
                $difference = $physicalStock - $systemStock;

                // Simpan item opname
                StockOpnameItem::create([
                    'id' => Str::uuid()->toString(),
                    'stock_opname_id' => $opname->id,
                    'product_id' => $product->id,
                    'system_stock' => $systemStock,
                    'physical_stock' => $physicalStock,
                    'difference' => $difference,
                    'reason' => $item['reason'] ?? null,
                ]);

                // Jika ada selisih, sesuaikan stok dan catat pergerakan (stock movement)
                if ($difference !== 0) {
                    $type = $difference > 0 ? 'IN' : 'OUT';
                    $qty = abs($difference);
                    
                    $product->recordStockMovement($type, $qty, [
                        'source_type' => 'stock_opname',
                        'description' => "Penyesuaian Stock Opname ({$opname->reference_number})",
                    ]);
                }
            }

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

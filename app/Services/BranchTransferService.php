<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\BranchTransfer;
use App\Models\BranchTransferItem;
use App\Models\Products;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BranchTransferService
{
    /**
     * Get paginated branch transfers
     */
    public function getTransfers(array $filters = [])
    {
        $query = BranchTransfer::with(['sourceBranch', 'destinationBranch', 'creator', 'items.product'])
            ->latest('created_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (! empty($filters['branch_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('source_branch_id', $filters['branch_id'])
                    ->orWhere('destination_branch_id', $filters['branch_id']);
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Create a new branch transfer as DRAFT
     */
    public function createTransfer(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();

            $sourceBranchId = $data['source_branch_id'] ?? $user->branch_id;

            // If user is super admin, they might have null tenant_id
            $tenantId = $user->tenant_id;
            if (! $tenantId && $sourceBranchId) {
                $tenantId = Branch::find($sourceBranchId)?->tenant_id;
            }

            if (! $tenantId) {
                throw new \Exception('Tenant ID is required but could not be determined.');
            }

            if (! $sourceBranchId) {
                throw new \Exception('Source Branch ID is required but could not be determined.');
            }

            $transfer = BranchTransfer::create([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $tenantId,
                'source_branch_id' => $sourceBranchId,
                'destination_branch_id' => $data['destination_branch_id'],
                'created_by' => $user->id,
                'status' => 'DRAFT',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                BranchTransferItem::create([
                    'id' => Str::uuid()->toString(),
                    'branch_transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'shipped_qty' => $item['qty'],
                    'received_qty' => 0,
                ]);
            }

            return $transfer->load('items.product');
        });
    }

    /**
     * Ship a transfer (deduct stock from source branch)
     */
    public function shipTransfer(BranchTransfer $transfer)
    {
        if ($transfer->status !== 'DRAFT') {
            throw new \Exception('Only DRAFT transfers can be shipped.');
        }

        return DB::transaction(function () use ($transfer) {
            $transfer->update([
                'status' => 'SHIPPED',
                'sent_at' => now(),
            ]);

            foreach ($transfer->items as $item) {
                $product = Products::find($item->product_id);
                // Reduce stock from source branch
                $product->recordStockMovement('OUT', $item->shipped_qty, [
                    'branch_id' => $transfer->source_branch_id,
                    'source_type' => 'branch_transfer',
                    'description' => "Pengiriman ke cabang tujuan ({$transfer->reference_number})",
                ]);
            }

            return $transfer;
        });
    }

    /**
     * Receive a transfer
     */
    public function receiveTransfer(BranchTransfer $transfer, array $itemsData)
    {
        if (! in_array($transfer->status, ['SHIPPED', 'PARTIAL'])) {
            throw new \Exception('Transfer cannot be received.');
        }

        return DB::transaction(function () use ($transfer, $itemsData) {
            $user = auth()->user();

            $itemsMap = collect($itemsData)->keyBy('id');
            $allReceived = true;
            $anyReceived = false;

            foreach ($transfer->items as $item) {
                if (isset($itemsMap[$item->id])) {
                    $receivedQty = (int) $itemsMap[$item->id]['received_qty'];
                    $unreceivedQty = $item->shipped_qty - $item->received_qty; // Remaining qty that can be received

                    if ($receivedQty > 0 && $receivedQty <= $unreceivedQty) {
                        $item->update([
                            'received_qty' => $item->received_qty + $receivedQty,
                        ]);

                        $sourceProduct = Products::find($item->product_id);
                        if ($sourceProduct) {
                            // Temukan produk di cabang tujuan dengan SKU/Barcode yang sama
                            $destProduct = Products::where('branch_id', $transfer->destination_branch_id)
                                ->where(function ($q) use ($sourceProduct) {
                                    if (!empty($sourceProduct->sku)) {
                                        $q->where('sku', $sourceProduct->sku);
                                    } elseif (!empty($sourceProduct->barcode)) {
                                        $q->where('barcode', $sourceProduct->barcode);
                                    } else {
                                        $q->where('name', $sourceProduct->name);
                                    }
                                })->first();

                            // Jika produk belum ada di cabang tujuan, duplikat secara otomatis
                            if (!$destProduct) {
                                $destProduct = Products::create([
                                    'tenant_id' => $transfer->tenant_id,
                                    'branch_id' => $transfer->destination_branch_id,
                                    'name' => $sourceProduct->name,
                                    'sku' => $sourceProduct->sku,
                                    'barcode' => $sourceProduct->barcode,
                                    'description' => $sourceProduct->description,
                                    'base_cost' => $sourceProduct->base_cost,
                                    'sell_price' => $sourceProduct->sell_price,
                                    'min_sell_price' => $sourceProduct->min_sell_price,
                                    'track_stock' => $sourceProduct->track_stock,
                                    'is_active' => $sourceProduct->is_active,
                                    'category_id' => $sourceProduct->category_id,
                                    'type_id' => $sourceProduct->type_id,
                                    'source' => $sourceProduct->source,
                                ]);
                            }

                            // Tambah stok ke produk cabang tujuan
                            $destProduct->recordStockMovement('IN', $receivedQty, [
                                'branch_id' => $transfer->destination_branch_id,
                                'source_type' => 'branch_transfer',
                                'description' => "Penerimaan dari cabang asal ({$transfer->reference_number})",
                            ]);
                        }
                    }
                }

                if ($item->received_qty < $item->shipped_qty) {
                    $allReceived = false;
                }
                if ($item->received_qty > 0) {
                    $anyReceived = true;
                }
            }

            $newStatus = $allReceived ? 'RECEIVED' : ($anyReceived ? 'PARTIAL' : $transfer->status);

            $transfer->update([
                'status' => $newStatus,
                'received_by' => $user->id,
                'received_at' => now(),
            ]);

            return $transfer->load('items.product');
        });
    }
}

<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Products;
use App\Models\CashBook;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PurchaseService
{
    /**
     * Store a new purchase transaction
     */
    public function storePurchase(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();
            
            // Resolve Tenant ID for Super Admin fallback
            $tenantId = $user->tenant_id;
            $branchId = $data['branch_id'];
            if (empty($tenantId)) {
                $branch = Branch::find($branchId);
                $tenantId = $branch ? $branch->tenant_id : null;
            }

            $globalDiscount = $data['global_discount'] ?? 0;
            $totalCost = collect($data['items'])->sum(fn($i) => ($i['qty'] * $i['unit_cost']) - ($i['discount'] ?? 0)) - $globalDiscount;

            $purchase = Purchase::create([
                'tenant_id'      => $tenantId,
                'branch_id'      => $branchId,
                'supplier_id'    => $data['supplier_id'] ?? null,
                'invoice_number' => $data['invoice_number'],
                'purchase_date'  => $data['purchase_date'],
                'status'         => $data['status'],
                'global_discount'=> $globalDiscount,
                'total_cost'     => $totalCost,
                'created_by'     => $user->id,
            ]);

            foreach ($data['items'] as $item) {
                $discount = $item['discount'] ?? 0;
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'unit_cost'  => $item['unit_cost'],
                    'discount'   => $discount,
                    'subtotal'   => ($item['qty'] * $item['unit_cost']) - $discount,
                ]);

                // SINKRONISASI OTOMATIS: Tambah stok jika diterima/lunas
                if (in_array($purchase->status, ['received', 'paid'])) {
                    $this->processProductReceipt($purchase, $item['product_id'], $item['qty'], $item['unit_cost'], $discount);
                }
            }

            // AKUNTANSI KEUANGAN: Jika dibuat langsung Lunas, otomatis potong saldo kas
            if ($purchase->status === 'paid') {
                $this->processPayment($purchase, $tenantId, $user->id);
            }

            \App\Services\ActivityLogger::log(
                'Transaksi Besar (PO)', 
                "Membuat Purchase Order: {$purchase->invoice_number} senilai " . number_format($totalCost, 0, ',', '.'),
                $purchase,
                ['status' => $purchase->status, 'total' => $totalCost]
            );

            return $purchase;
        });
    }

    /**
     * Update the status of an existing purchase
     */
    public function updateStatus(Purchase $purchase, string $newStatus): void
    {
        DB::transaction(function () use ($purchase, $newStatus) {
            $oldStatus = $purchase->status;

            if ($oldStatus === $newStatus) {
                return;
            }

            $purchase->update(['status' => $newStatus]);

            // Resolving IDs
            $tenantId = $purchase->tenant_id;
            $userId = Auth::id() ?? $tenantId;

            // LOGIKA AKUNTANSI: Jika dari Draft -> Masuk Gudang (Received/Paid)
            if ($oldStatus === 'draft' && in_array($newStatus, ['received', 'paid'])) {
                foreach ($purchase->items as $item) {
                    $this->processProductReceipt($purchase, $item->product_id, $item->qty, $item->unit_cost, $item->discount);
                }
            }
            
            // LOGIKA AKUNTANSI: Jika di-Revert dari Masuk Gudang -> kembali ke Draft
            if (in_array($oldStatus, ['received', 'paid']) && $newStatus === 'draft') {
                foreach ($purchase->items as $item) {
                    $this->revertProductReceipt($purchase, $item->product_id, $item->qty, $item->unit_cost);
                }
            }

            // AKUNTANSI KEUANGAN: Jika Lunas, otomatis potong saldo kas
            if ($newStatus === 'paid' && $oldStatus !== 'paid') {
                $this->processPayment($purchase, $tenantId, $userId);
            }

            // AKUNTANSI KEUANGAN: Jika di-Revert dari Paid, kembalikan uang (hapus kas keluar)
            if ($oldStatus === 'paid' && $newStatus !== 'paid') {
                $this->revertPayment($purchase);
            }
        });
    }

    private function processProductReceipt(Purchase $purchase, string $productId, int $qty, float $unitCost, float $discount): void
    {
        $product = Products::withCurrentStock()->find($productId);
        if ($product && $product->track_stock) {
            $effectiveUnitCost = $qty > 0 ? (($qty * $unitCost) - $discount) / $qty : $unitCost;
            
            // UPDATE BASE COST (WAC)
            $product->updateBaseCostWAC((float) $effectiveUnitCost, $qty);

            $product->recordStockMovement('IN', $qty, [
                'branch_id'   => $purchase->branch_id,
                'source_type' => 'purchase',
                'notes'       => 'Penerimaan PO: ' . ($purchase->invoice_number ?: 'Tanpa No. INV'),
                'unit_cost'   => $effectiveUnitCost,
            ]);
        }
    }

    private function revertProductReceipt(Purchase $purchase, string $productId, int $qty, float $unitCost): void
    {
        $product = Products::find($productId);
        if ($product && $product->track_stock) {
            $product->recordStockMovement('OUT', $qty, [
                'branch_id'   => $purchase->branch_id,
                'source_type' => 'purchase_revert',
                'notes'       => 'Pembatalan PO ke Draft: ' . ($purchase->invoice_number ?: 'Draft'),
                'unit_cost'   => $unitCost,
            ]);
        }
    }

    private function processPayment(Purchase $purchase, ?string $tenantId, ?string $userId): void
    {
        CashBook::create([
            'tenant_id'      => $tenantId,
            'branch_id'      => $purchase->branch_id,
            'type'           => 'out',
            'category'       => 'pembelian',
            'amount'         => $purchase->total_cost,
            'reference_type' => 'purchase',
            'reference_id'   => $purchase->id,
            'note'           => 'Pembayaran PO ke Supplier: ' . ($purchase->invoice_number ?: 'Tanpa No. INV'),
            'created_by'     => $userId,
        ]);
    }

    private function revertPayment(Purchase $purchase): void
    {
        CashBook::where('reference_type', 'purchase')
            ->where('reference_id', $purchase->id)
            ->where('type', 'out')
            ->where('category', 'pembelian')
            ->delete();
    }
}

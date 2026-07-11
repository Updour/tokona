<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\CashBook;
use App\Models\Products;
use App\Models\Purchase;
use App\Models\PurchasePayment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    protected AccountingService $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

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
            $totalCost = collect($data['items'])->sum(fn ($i) => ($i['qty'] * $i['unit_cost']) - ($i['discount'] ?? 0)) - $globalDiscount;

            $purchase = Purchase::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'supplier_id' => $data['supplier_id'] ?? null,
                'invoice_number' => $data['invoice_number'],
                'purchase_date' => $data['purchase_date'],
                'due_date' => $data['due_date'] ?? null,
                'status' => $data['status'],
                'payment_status' => 'unpaid',
                'amount_paid' => 0,
                'global_discount' => $globalDiscount,
                'total_cost' => $totalCost,
                'created_by' => $user->id,
            ]);

            foreach ($data['items'] as $item) {
                $discount = $item['discount'] ?? 0;
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_cost' => $item['unit_cost'],
                    'discount' => $discount,
                    'subtotal' => ($item['qty'] * $item['unit_cost']) - $discount,
                ]);

                // SINKRONISASI OTOMATIS: Tambah stok jika diterima/lunas
                if (in_array($purchase->status, ['received', 'paid'])) {
                    $this->processProductReceipt($purchase, $item['product_id'], $item['qty'], $item['unit_cost'], $discount);
                }
            }

            // P2P: Jika langsung masuk gudang (Received / Paid), buat Jurnal Penerimaan (Hutang Muncul)
            if (in_array($purchase->status, ['received', 'paid'])) {
                $this->accountingService->generatePurchaseReceiptJournal($purchase);
            }

            // P2P: Jika dibuat langsung Lunas, otomatis bayar lunas
            if ($purchase->status === 'paid') {
                $this->addPayment($purchase, [
                    'amount' => $totalCost,
                    'payment_date' => $data['purchase_date'],
                    'payment_method' => $data['payment_method'] ?? 'Cash',
                    'notes' => 'Pelunasan otomatis saat pembuatan PO',
                ], $user->id);
            } elseif (! empty($data['initial_payment']) && $data['initial_payment'] > 0) {
                // P2P: Jika ada DP/Uang Muka
                $this->addPayment($purchase, [
                    'amount' => $data['initial_payment'],
                    'payment_date' => $data['purchase_date'],
                    'payment_method' => $data['payment_method'] ?? 'Cash',
                    'notes' => 'Pembayaran Uang Muka (DP)',
                ], $user->id);
            }

            ActivityLogger::log(
                'Transaksi Besar (PO)',
                "Membuat Purchase Order: {$purchase->invoice_number} senilai ".number_format($totalCost, 0, ',', '.'),
                $purchase,
                ['status' => $purchase->status, 'total' => $totalCost]
            );

            return $purchase;
        });
    }

    /**
     * Catat pembayaran DP atau Cicilan (Partial/Full)
     */
    public function addPayment(Purchase $purchase, array $data, ?string $userId = null): PurchasePayment
    {
        return DB::transaction(function () use ($purchase, $data, $userId) {
            $userId = $userId ?? Auth::id();

            if ($purchase->payment_status === 'paid' || $purchase->amount_paid >= $purchase->total_cost) {
                throw new \Exception('Pembelian ini sudah lunas.');
            }

            $amountToPay = min($data['amount'], $purchase->total_cost - $purchase->amount_paid);

            $payment = PurchasePayment::create([
                'purchase_id' => $purchase->id,
                'amount' => $amountToPay,
                'payment_date' => $data['payment_date'] ?? now()->toDateString(),
                'payment_method' => $data['payment_method'] ?? 'Cash/Transfer',
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            // Update status pembayaran di Purchase
            $newAmountPaid = $purchase->amount_paid + $amountToPay;
            $paymentStatus = $newAmountPaid >= $purchase->total_cost ? 'paid' : 'partial';

            // Jika barang sudah diterima dan pembayaran lunas, status PO jadi paid
            $poStatus = $purchase->status;
            if ($purchase->status === 'received' && $paymentStatus === 'paid') {
                $poStatus = 'paid';
            }

            $purchase->update([
                'amount_paid' => $newAmountPaid,
                'payment_status' => $paymentStatus,
                'status' => $poStatus,
            ]);

            // Catat pengeluaran di Buku Kas
            CashBook::create([
                'tenant_id' => $purchase->tenant_id,
                'branch_id' => $purchase->branch_id,
                'type' => 'out',
                'category' => 'pembayaran_hutang',
                'amount' => $amountToPay,
                'reference_type' => 'purchase_payment',
                'reference_id' => $payment->id,
                'note' => 'Pembayaran PO ke Supplier: '.($purchase->invoice_number ?: 'Tanpa No. INV'),
                'created_by' => $userId,
            ]);

            // Penjurnalan Akuntansi Ganda (Mendebit Hutang, Mengkredit Kas)
            $this->accountingService->generatePurchasePaymentJournal($payment, $purchase);

            return $payment;
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

            $userId = Auth::id() ?? $purchase->tenant_id;

            // LOGIKA AKUNTANSI P2P: Jika dari Draft -> Masuk Gudang (Received)
            if ($oldStatus === 'draft' && in_array($newStatus, ['received', 'paid'])) {
                foreach ($purchase->items as $item) {
                    $this->processProductReceipt($purchase, $item->product_id, $item->qty, $item->unit_cost, $item->discount);
                }
                $this->accountingService->generatePurchaseReceiptJournal($purchase);
            }

            // Jika diubah jadi paid otomatis lunasi sisa hutang
            if ($newStatus === 'paid' && $purchase->amount_paid < $purchase->total_cost) {
                $this->addPayment($purchase, [
                    'amount' => $purchase->total_cost - $purchase->amount_paid,
                    'payment_date' => now()->toDateString(),
                    'payment_method' => 'Cash/Transfer',
                    'notes' => 'Auto pelunasan karena update status menjadi Paid',
                ], $userId);
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
                'branch_id' => $purchase->branch_id,
                'source_type' => 'purchase',
                'notes' => 'Penerimaan PO: '.($purchase->invoice_number ?: 'Tanpa No. INV'),
                'unit_cost' => $effectiveUnitCost,
            ]);
        }
    }
}

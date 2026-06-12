<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\CashBook;
use App\Models\CashRegisterShift;
use App\Models\Customer;
use App\Models\Products;
use App\Models\Promo;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PosService
{
    /**
     * Ambil data lengkap untuk inisialisasi halaman kasir POS.
     */
    public function getPosPageData(array $filters): array
    {
        $user = Auth::user();
        
        // Produk aktif dengan saringan cabang dan hitungan stok real-time
        $products = Products::active()
            ->withCurrentStock()
            ->withListRelations()
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'barcode' => $p->barcode,
                    'description' => $p->description,
                    'base_cost' => (float) $p->base_cost,
                    'sell_price' => (float) $p->sell_price,
                    'min_sell_price' => (float) $p->min_sell_price,
                    'track_stock' => $p->track_stock,
                    'current_stock' => (int) $p->current_stock,
                    'image' => $p->images->first()?->url ?? null,
                    'category' => $p->category?->name ?? 'Tanpa Kategori',
                ];
            });

        // Daftar pelanggan untuk member checkout
        $customers = Customer::orderBy('name')->get();

        // Daftar promo/voucher aktif saat ini
        $promos = Promo::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->get();

        // Cabang aktif saat ini (cabang user atau semua jika super admin)
        $branches = $user->isSuperAdmin()
            ? Branch::orderBy('name')->get()
            : Branch::where('id', $user->branch_id)->get();

        // Riwayat transaksi penjualan terbaru
        $transactions = Transaction::with(['customer', 'items.product', 'creator'])
            ->orderByDesc('created_at')
            ->take(50)
            ->get();

        $currentBranch = Branch::find($user->branch_id);
        $defaultSettings = $currentBranch ? $currentBranch->pos_settings : null;

        if (!$defaultSettings) {
            $defaultSettings = [
                'taxEnabled' => true,
                'taxRate' => 11,
                'activeMethods' => [
                    'cash' => true,
                    'transfer' => true,
                    'debt' => true
                ],
                'roundingNearest' => 100,
                'roundingMethod' => 'floor',
                'require_shift' => true,
                'enable_canvas' => false,
            ];
        } else {
            // Ensure fallback for existing branches
            if (!isset($defaultSettings['require_shift'])) {
                $defaultSettings['require_shift'] = true;
            }
            if (!isset($defaultSettings['enable_canvas'])) {
                $defaultSettings['enable_canvas'] = false;
            }
        }

        // Shift kasir aktif (jika ada)
        $activeShift = CashRegisterShift::open()
            ->where('user_id', $user->id)
            ->latest('opened_at')
            ->first();

        $tenant = \App\Models\Tenants::find($tenantId);
        $loyaltySettings = $tenant ? $tenant->getLoyaltySettings() : ['earn_amount' => 10000, 'redeem_rate' => 1];

        return [
            'products' => $products,
            'customers' => $customers,
            'promos' => $promos,
            'branches' => $branches,
            'transactions' => $transactions,
            'defaultSettings' => $defaultSettings,
            'activeShift' => $activeShift,
            'filters' => $filters,
            'loyaltySettings' => $loyaltySettings,
        ];
    }

    /**
     * Proses transaksi checkout POS.
     */
    public function processCheckout(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();
            $branchId = $user->branch_id ?? Branch::first()->id;

            $branch = Branch::findOrFail($branchId);
            $tenantId = $user->tenant_id ?? $branch->tenant_id;

            // Fallback tenant_id if still empty (e.g. Super Admin)
            if (empty($tenantId)) {
                $fallbackBranch = Branch::first();
                $tenantId = $fallbackBranch ? $fallbackBranch->tenant_id : null;
            }

            $posSettings = $branch->pos_settings ?? [];
            $requireShift = $posSettings['require_shift'] ?? true;

            // Validasi shift aktif — blokir checkout jika belum ada shift dan require_shift true
            $activeShift = CashRegisterShift::open()
                ->where('user_id', $user->id)
                ->latest('opened_at')
                ->first();

            if ($requireShift && !$activeShift && empty($data['is_offline_sync'])) {
                throw new \RuntimeException('Tidak bisa checkout. Buka shift kasir terlebih dahulu.');
            }

            // Generate invoice number INV/YYYYMMDD/[BRANCH_CODE]/[COUNTER]
            $today = date('Ymd');
            $branch = Branch::findOrFail($branchId);
            $branchCode = $branch->code ?? 'HO';
            
            // If offline sync, we might just append a unique identifier to avoid clash if multiple syncs happen
            $todayCount = Transaction::whereDate('created_at', today())
                ->where('branch_id', $branchId)
                ->count();
            
            $sequence = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
            $invoiceNumber = "INV/{$today}/{$branchCode}/{$sequence}";
            
            if (!empty($data['is_offline_sync'])) {
                $invoiceNumber .= '-OFF';
            }

            // Tentukan status awal
            $status = $data['payment_method'] === 'debt' ? 'draft' : 'paid';

            // Proses potongan poin loyalty (redeem points)
            if (!empty($data['customer_id']) && !empty($data['redeem_points']) && $data['redeem_points'] > 0) {
                $customer = Customer::find($data['customer_id']);
                if ($customer && $customer->points >= $data['redeem_points']) {
                    $customer->decrement('points', $data['redeem_points']);
                } else {
                    throw new \RuntimeException('Poin pelanggan tidak mencukupi untuk diredeem.');
                }
            }

            // Simpan transaksi induk
            $transaction = Transaction::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'shift_id' => $activeShift ? $activeShift->id : null,
                'invoice_number' => $invoiceNumber,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $data['subtotal'],
                'discount' => $data['discount'],
                'tax' => $data['tax'],
                'rounding_diff' => $data['rounding_diff'] ?? 0,
                'total' => $data['total'],
                'total_cogs' => 0, // Akan di-update setelah loop item
                'paid_amount' => $data['paid_amount'],
                'cash_amount' => $data['payment_method'] === 'cash' ? $data['paid_amount'] : ($data['cash_amount'] ?? 0),
                'transfer_amount' => $data['payment_method'] === 'transfer' ? $data['paid_amount'] : ($data['transfer_amount'] ?? 0),
                'change_amount' => $data['change_amount'],
                'payment_method' => $data['payment_method'],
                'status' => $status,
                'created_by' => $user->id,
            ]);

            $totalCogs = 0;

            // Simpan item-item detail penjualan & potong stok
            foreach ($data['items'] as $item) {
                $product = Products::findOrFail($item['product_id']);
                $itemCogs = $product->base_cost * $item['qty'];
                $totalCogs += $itemCogs;

                // Simpan detail item transaksi
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'base_cost' => $product->base_cost,
                    'subtotal' => $item['subtotal'],
                ]);

                // Potong stok barang (StockMovement OUT) jika dilacak
                if ($product->track_stock) {
                    StockMovement::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'product_id' => $product->id,
                        'type' => 'OUT',
                        'qty' => $item['qty'],
                        'unit_cost' => $product->base_cost,
                        'unit_price' => $item['price'],
                        'source_type' => 'sale',
                        'source_id' => $transaction->id,
                        'notes' => "Penjualan Kasir POS - Invoice: {$invoiceNumber}",
                    ]);
                }
            }

            // Update total_cogs pada transaksi induk
            $transaction->update(['total_cogs' => $totalCogs]);

            // Proses tambahan untuk Pelanggan / Keanggotaan
            if (!empty($data['customer_id'])) {
                $customer = Customer::findOrFail($data['customer_id']);

                // 1. Catat hutang jika menggunakan metode 'debt'
                if ($data['payment_method'] === 'debt') {
                    $customer->increment('debt_balance', $transaction->total);
                }

                // 2. Loyalty points: Berikan poin berdasarkan kelipatan belanja sesuai setting
                $tenant = \App\Models\Tenants::find($tenantId);
                $loyaltySettings = $tenant ? $tenant->getLoyaltySettings() : ['earn_amount' => 10000];
                $earnAmount = max(1, (int) $loyaltySettings['earn_amount']);
                $pointsEarned = (int) floor($transaction->total / $earnAmount);

                // 3. Bonus Poin Pembulatan: Jika pembulatan tunai menyebabkan toko "menyerap" kekurangan
                //    (rounding_diff < 0, artinya pelanggan membayar lebih sedikit), uang receh yang
                //    disubsidi toko dikonversi menjadi poin bonus untuk pelanggan.
                //    Contoh: total Rp 25.700 dibulatkan ke Rp 25.500 → diff = -200 → +2 poin bonus.
                $roundingBonus = 0;
                $roundingDiff = (float) ($data['rounding_diff'] ?? 0);
                if ($roundingDiff < 0 && $data['payment_method'] === 'cash') {
                    $roundingBonus = (int) floor(abs($roundingDiff) / 100);
                }

                $totalPoints = $pointsEarned + $roundingBonus;
                if ($totalPoints > 0) {
                    $customer->increment('points', $totalPoints);
                }

                // Update info transaksi terakhir
                $customer->update([
                    'last_transaction_at' => now(),
                ]);
            }

            // Integrasi Buku Kas (CashBook) untuk Laporan Keuangan
            // TRANSAKSI NON-TUNAI (Transfer, dll): Uang langsung masuk rekening perusahaan, otomatis catat di Buku Kas.
            // TRANSAKSI TUNAI (Cash): Uang masuk ke Laci Kasir (Shift), TIDAK dicatat di Buku Kas sampai Tutup Shift.
            if ($data['payment_method'] === 'transfer' || $data['payment_method'] === 'split') {
                $transferValue = $data['payment_method'] === 'split' 
                    ? (float) ($data['transfer_amount'] ?? 0) 
                    : (float) min($transaction->total, $transaction->paid_amount);
                
                if ($transferValue > 0) {
                    CashBook::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'type' => 'in',
                        'category' => 'penjualan',
                        'amount' => $transferValue,
                        'reference_type' => 'sale',
                        'reference_id' => $transaction->id,
                        'note' => "Penerimaan POS Non-Tunai ({$data['payment_method']}) - Invoice: {$invoiceNumber}",
                        'created_by' => $user->id,
                    ]);
                }
            }

            \App\Services\ActivityLogger::log(
                'Transaksi POS', 
                "Melakukan checkout penjualan POS: {$invoiceNumber} senilai " . number_format($transaction->total, 0, ',', '.'),
                $transaction,
                ['payment_method' => $data['payment_method'], 'total' => $transaction->total]
            );

            return $transaction;
        });
    }

    /**
     * Proses retur transaksi penjualan POS.
     */
    public function processReturn(array $data): void
    {
        DB::transaction(function () use ($data) {
            $user = Auth::user();
            $transaction = Transaction::findOrFail($data['transaction_id']);
            $branchId = $transaction->branch_id;

            $tenantId = $transaction->tenant_id ?? $user->tenant_id;
            if (empty($tenantId)) {
                $branch = Branch::find($branchId);
                $tenantId = $branch ? $branch->tenant_id : null;
            }
            if (empty($tenantId)) {
                $fallbackBranch = Branch::first();
                $tenantId = $fallbackBranch ? $fallbackBranch->tenant_id : null;
            }
            
            // Tandai status transaksi menjadi returned
            $transaction->update(['status' => 'returned']);

            foreach ($data['items'] as $item) {
                $product = Products::findOrFail($item['product_id']);
                
                // Kembalikan stok barang (StockMovement type RETURN) jika dilacak
                if ($product->track_stock) {
                    StockMovement::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'product_id' => $product->id,
                        'type' => 'RETURN',
                        'qty' => $item['qty'],
                        'unit_cost' => $product->base_cost,
                        'unit_price' => $item['price'],
                        'source_type' => 'sale_return',
                        'source_id' => $transaction->id,
                        'notes' => "Retur Penjualan Kasir POS - Inv: {$transaction->invoice_number}",
                    ]);
                }
            }

            // Jika bukan metode piutang/hutang, kurangi/keluarkan kas dari CashBook
            if ($transaction->payment_method !== 'debt') {
                $amountRefunded = (float) $transaction->total;
                CashBook::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'type' => 'out',
                    'category' => 'retur',
                    'amount' => $amountRefunded,
                    'reference_type' => 'sale_return',
                    'reference_id' => $transaction->id,
                    'note' => "Pengembalian Dana Retur POS - Inv: {$transaction->invoice_number}",
                    'created_by' => $user->id,
                ]);
            } else {
                // Jika metode hutang, potong saldo piutang/hutang milik pelanggan
                if ($transaction->customer_id) {
                    $customer = Customer::findOrFail($transaction->customer_id);
                    $customer->decrement('debt_balance', $transaction->total);
                }
            }
        });
    }

    /**
     * Memproses Pelunasan Piutang (Debt Payment)
     */
    public function processPayDebt(string $transactionId, array $data): void
    {
        $user = Auth::user();
        $transaction = Transaction::where('id', $transactionId)
            ->where('payment_method', 'debt')
            ->whereIn('status', ['draft', 'partial']) // Piutang yang belum lunas
            ->firstOrFail();

        DB::transaction(function () use ($transaction, $data, $user) {
            $amountPaid = (float) $data['amount'];
            $newPaidAmount = $transaction->paid_amount + $amountPaid;

            // Jika lunas atau lebih
            if ($newPaidAmount >= $transaction->total) {
                $transaction->status = 'paid';
                $transaction->paid_amount = $transaction->total;
            } else {
                $transaction->status = 'partial';
                $transaction->paid_amount = $newPaidAmount;
            }

            if ($data['payment_method'] === 'cash') {
                $transaction->cash_amount = ($transaction->cash_amount ?? 0) + $amountPaid;
            } else {
                $transaction->transfer_amount = ($transaction->transfer_amount ?? 0) + $amountPaid;
            }

            $transaction->save();

            // Kurangi saldo piutang pelanggan
            if ($transaction->customer_id) {
                $customer = Customer::find($transaction->customer_id);
                if ($customer) {
                    $customer->decrement('debt_balance', $amountPaid);
                }
            }

            $tenantId = $transaction->tenant_id ?? $user->tenant_id;
            if (empty($tenantId)) {
                $branch = Branch::find($transaction->branch_id);
                $tenantId = $branch ? $branch->tenant_id : null;
            }
            if (empty($tenantId)) {
                $fallbackBranch = Branch::first();
                $tenantId = $fallbackBranch ? $fallbackBranch->tenant_id : null;
            }

            CashBook::create([
                'tenant_id' => $tenantId,
                'branch_id' => $transaction->branch_id,
                'type' => 'in',
                'category' => 'penjualan',
                'amount' => $amountPaid,
                'reference_type' => 'sale_payment',
                'reference_id' => $transaction->id,
                'note' => "Pelunasan Piutang ({$data['payment_method']}) - Invoice: {$transaction->invoice_number}",
                'created_by' => $user->id,
            ]);
        });
    }

    /**
     * Simpan pengaturan POS Kasir Terminal ke database Cabang (Branch).
     */
    public function savePosSettings(array $settings): void
    {
        $user = Auth::user();
        if ($user && $user->branch_id) {
            $branch = Branch::find($user->branch_id);
            if ($branch) {
                $branch->update([
                    'pos_settings' => [
                        'taxEnabled' => (bool) $settings['taxEnabled'],
                        'taxRate' => (int) $settings['taxRate'],
                        'activeMethods' => [
                            'cash' => (bool) $settings['activeMethods']['cash'],
                            'transfer' => (bool) $settings['activeMethods']['transfer'],
                            'debt' => (bool) $settings['activeMethods']['debt'],
                        ],
                        'roundingNearest' => (int) ($settings['roundingNearest'] ?? 100),
                        'roundingMethod' => (string) ($settings['roundingMethod'] ?? 'floor'),
                        'require_shift' => (bool) ($settings['require_shift'] ?? true),
                        'enable_canvas' => (bool) ($settings['enable_canvas'] ?? false),
                    ]
                ]);
            }
        }
    }
}

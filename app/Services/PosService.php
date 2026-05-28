<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\CashBook;
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
                'roundingMethod' => 'floor'
            ];
        }

        return [
            'products' => $products,
            'customers' => $customers,
            'promos' => $promos,
            'branches' => $branches,
            'transactions' => $transactions,
            'defaultSettings' => $defaultSettings,
            'filters' => $filters,
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

            // Generate invoice number INV/YYYYMMDD/[BRANCH_CODE]/[COUNTER]
            $today = date('Ymd');
            $branch = Branch::findOrFail($branchId);
            $branchCode = $branch->code ?? 'HO';
            
            $todayCount = Transaction::whereDate('created_at', today())
                ->where('branch_id', $branchId)
                ->count();
            
            $sequence = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
            $invoiceNumber = "INV/{$today}/{$branchCode}/{$sequence}";

            // Tentukan status awal
            $status = $data['payment_method'] === 'debt' ? 'draft' : 'paid';

            // Simpan transaksi induk
            $transaction = Transaction::create([
                'tenant_id' => $user->tenant_id,
                'branch_id' => $branchId,
                'invoice_number' => $invoiceNumber,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $data['subtotal'],
                'discount' => $data['discount'],
                'tax' => $data['tax'],
                'rounding_diff' => $data['rounding_diff'] ?? 0,
                'total' => $data['total'],
                'paid_amount' => $data['paid_amount'],
                'change_amount' => $data['change_amount'],
                'payment_method' => $data['payment_method'],
                'status' => $status,
                'created_by' => $user->id,
            ]);

            // Simpan item-item detail penjualan & potong stok
            foreach ($data['items'] as $item) {
                $product = Products::findOrFail($item['product_id']);

                // Simpan detail item transaksi
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Potong stok barang (StockMovement OUT) jika dilacak
                if ($product->track_stock) {
                    StockMovement::create([
                        'tenant_id' => $user->tenant_id,
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

            // Proses tambahan untuk Pelanggan / Keanggotaan
            if (!empty($data['customer_id'])) {
                $customer = Customer::findOrFail($data['customer_id']);

                // 1. Catat hutang jika menggunakan metode 'debt'
                if ($data['payment_method'] === 'debt') {
                    $customer->increment('debt_balance', $transaction->total);
                }

                // 2. Loyalty points: Berikan 1 poin setiap kelipatan Rp 10.000 belanja
                $pointsEarned = (int) floor($transaction->total / 10000);
                if ($pointsEarned > 0) {
                    $customer->increment('points', $pointsEarned);
                }

                // Update info transaksi terakhir
                $customer->update([
                    'last_transaction_at' => now(),
                ]);
            }

            // Integrasi Buku Kas (CashBook) untuk Laporan Keuangan
            // Uang kas masuk dicatat jika metode bayar bukan hutang (debt)
            if ($data['payment_method'] !== 'debt') {
                $cashReceived = (float) min($transaction->total, $transaction->paid_amount);
                
                CashBook::create([
                    'tenant_id' => $user->tenant_id,
                    'branch_id' => $branchId,
                    'type' => 'in',
                    'category' => 'penjualan',
                    'amount' => $cashReceived,
                    'reference_type' => 'sale',
                    'reference_id' => $transaction->id,
                    'note' => "Penerimaan Kasir POS - Invoice: {$invoiceNumber}",
                    'created_by' => $user->id,
                ]);
            }

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
            
            // Tandai status transaksi menjadi returned
            $transaction->update(['status' => 'returned']);

            foreach ($data['items'] as $item) {
                $product = Products::findOrFail($item['product_id']);
                
                // Kembalikan stok barang (StockMovement type RETURN) jika dilacak
                if ($product->track_stock) {
                    StockMovement::create([
                        'tenant_id' => $user->tenant_id,
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
                    'tenant_id' => $user->tenant_id,
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
                    ]
                ]);
            }
        }
    }
}

<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Branch;
use App\Models\Journal;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Membuat Jurnal Manual (Double Entry)
     * Memastikan total Debit = total Kredit sebelum menyimpan.
     */
    public function storeManualJournal(array $data): Journal
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();

            // Tentukan Tenant
            $tenantId = $user->tenant_id;
            $branchId = $data['branch_id'] ?? $user->branch_id;

            // SuperAdmin bisa jadi tidak punya tenant_id, ambil dari branch
            if (empty($tenantId) && ! empty($branchId)) {
                $branch = Branch::find($branchId);
                $tenantId = $branch ? $branch->tenant_id : null;
            }

            // Validasi Double Entry (Debit = Kredit)
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($data['entries'] as $entry) {
                $totalDebit += (float) ($entry['debit'] ?? 0);
                $totalCredit += (float) ($entry['credit'] ?? 0);
            }

            // Mencegah selisih pembulatan (presisi desimal)
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new \InvalidArgumentException('Total Debit ('.number_format($totalDebit, 2).') tidak seimbang dengan Total Kredit ('.number_format($totalCredit, 2).')');
            }

            // Simpan Induk Jurnal
            $journal = Journal::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'reference_number' => $data['reference_number'] ?? null, // Jika null akan auto-generate di model
                'date' => $data['date'],
                'description' => $data['description'],
                'source_type' => $data['source_type'] ?? 'manual_journal',
                'source_id' => $data['source_id'] ?? null,
                'created_by' => $user->id,
            ]);

            // Simpan Baris Jurnal (Entries)
            foreach ($data['entries'] as $entry) {
                JournalEntry::create([
                    'journal_id' => $journal->id,
                    'account_id' => $entry['account_id'],
                    'debit' => $entry['debit'] ?? 0,
                    'credit' => $entry['credit'] ?? 0,
                    'description' => $entry['description'] ?? null,
                ]);
            }

            return $journal;
        });
    }

    /**
     * Menghapus Jurnal beserta baris entry-nya
     */
    public function destroyJournal(Journal $journal): void
    {
        DB::transaction(function () use ($journal) {
            // Hapus semua entries terlebih dahulu
            $journal->entries()->delete();

            // Hapus induk jurnal
            $journal->delete();
        });
    }

    /**
     * Generate Default Chart of Accounts (COA) untuk Tenant
     */
    public function generateDefaultCOA(string $tenantId, ?string $branchId = null): void
    {
        $defaultAccounts = [
            // Aset (Aktiva)
            ['code' => '111', 'name' => 'Kas & Bank', 'type' => 'asset'],
            ['code' => '112', 'name' => 'Piutang Usaha', 'type' => 'asset'],
            ['code' => '113', 'name' => 'Persediaan Barang Dagang', 'type' => 'asset'],

            // Kewajiban (Pasiva)
            ['code' => '211', 'name' => 'Hutang Usaha', 'type' => 'liability'],

            // Ekuitas (Modal)
            ['code' => '311', 'name' => 'Modal Pemilik', 'type' => 'equity'],
            ['code' => '312', 'name' => 'Laba Ditahan', 'type' => 'equity'],

            // Pendapatan
            ['code' => '411', 'name' => 'Pendapatan Penjualan', 'type' => 'revenue'],

            // Beban (Biaya)
            ['code' => '511', 'name' => 'Harga Pokok Penjualan (HPP)', 'type' => 'expense'],
            ['code' => '611', 'name' => 'Biaya Operasional', 'type' => 'expense'],
        ];

        DB::transaction(function () use ($tenantId, $branchId, $defaultAccounts) {
            foreach ($defaultAccounts as $acc) {
                Account::firstOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'code' => $acc['code'],
                    ],
                    [
                        'branch_id' => $branchId,
                        'name' => $acc['name'],
                        'type' => $acc['type'],
                        'is_active' => true,
                    ]
                );
            }
        });
    }

    /**
     * Auto-Journaling untuk Transaksi POS (Penjualan & HPP)
     */
    public function generatePosJournal($transaction): void
    {
        $tenantId = $transaction->tenant_id;
        $branchId = $transaction->branch_id;

        // Pastikan COA sudah ada, jika belum, buat otomatis
        $this->generateDefaultCOA($tenantId, $branchId);

        $accounts = Account::where('tenant_id', $tenantId)->get()->keyBy('code');

        $entries = [];

        $customerName = $transaction->customer ? $transaction->customer->name : 'Umum';

        $totalAmount = (float) $transaction->total;
        $paidAmount = (float) $transaction->paid_amount;
        $changeAmount = (float) ($transaction->change_amount ?? 0);
        // Batasi netPaidAmount maksimal sebesar total tagihan agar jurnal seimbang
        // (menghindari error jika kasir input bayar > tagihan tapi lupa isi change_amount)
        $actualPaid = max(0, $paidAmount - $changeAmount);
        $netPaidAmount = min($totalAmount, $actualPaid);
        $remainingBalance = max(0, $totalAmount - $netPaidAmount);

        // 1. Catat Pembayaran Langsung (DP/Lunas) ke Kas
        if ($netPaidAmount > 0) {
            $entries[] = [
                'account_id' => $accounts['111']->id, // Kas
                'debit' => $netPaidAmount,
                'credit' => 0,
                'description' => 'Pembayaran POS Inv: '.$transaction->invoice_number.' ('.$customerName.')',
            ];
        }

        // 2. Catat Sisa Belum Dibayar ke Piutang Usaha
        if ($remainingBalance > 0) {
            $entries[] = [
                'account_id' => $accounts['112']->id, // Piutang
                'debit' => $remainingBalance,
                'credit' => 0,
                'description' => 'Piutang POS Inv: '.$transaction->invoice_number.' ('.$customerName.')',
            ];
        }

        // 3. Catat Pendapatan Penjualan
        $entries[] = [
            'account_id' => $accounts['411']->id, // Pendapatan Penjualan
            'debit' => 0,
            'credit' => $totalAmount,
            'description' => 'Pendapatan POS Inv: '.$transaction->invoice_number.' ('.$customerName.')',
        ];

        // 3. Catat HPP (Harga Pokok Penjualan)
        if ($transaction->total_cogs > 0) {
            $entries[] = [
                'account_id' => $accounts['511']->id, // HPP
                'debit' => $transaction->total_cogs,
                'credit' => 0,
                'description' => 'HPP Inv: '.$transaction->invoice_number,
            ];

            // 4. Catat Pengurangan Persediaan
            $entries[] = [
                'account_id' => $accounts['113']->id, // Persediaan Barang
                'debit' => 0,
                'credit' => $transaction->total_cogs,
                'description' => 'Pengurangan Stok Inv: '.$transaction->invoice_number,
            ];
        }

        // Simpan sebagai Jurnal (Double Entry)
        $this->storeManualJournal([
            'branch_id' => $branchId,
            'reference_number' => null, // Biarkan model yang auto-generate dengan format JNL-DDMMM-YYYY-XXXXX
            'date' => $transaction->created_at->toDateString(),
            'description' => 'Auto-Journal Penjualan POS ('.$customerName.'): '.$transaction->invoice_number,
            'source_type' => 'pos_sale',
            'source_id' => $transaction->id,
            'entries' => $entries,
        ]);
    }

    /**
     * Auto-Journaling untuk Pelunasan Piutang POS
     */
    public function generatePosPaymentJournal($transaction, $amountPaid): void
    {
        $tenantId = $transaction->tenant_id;
        $branchId = $transaction->branch_id;

        $this->generateDefaultCOA($tenantId, $branchId);
        $accounts = Account::where('tenant_id', $tenantId)->get()->keyBy('code');

        $customerName = $transaction->customer ? $transaction->customer->name : 'Umum';

        $entries = [
            [
                'account_id' => $accounts['111']->id, // Kas bertambah
                'debit' => $amountPaid,
                'credit' => 0,
                'description' => 'Pelunasan Piutang Inv: '.$transaction->invoice_number.' ('.$customerName.')',
            ],
            [
                'account_id' => $accounts['112']->id, // Piutang berkurang
                'debit' => 0,
                'credit' => $amountPaid,
                'description' => 'Pelunasan Piutang Inv: '.$transaction->invoice_number.' ('.$customerName.')',
            ],
        ];

        $this->storeManualJournal([
            'branch_id' => $branchId,
            'reference_number' => null, // Biarkan model yang auto-generate
            'date' => now()->toDateString(),
            'description' => 'Auto-Journal Pelunasan Piutang POS ('.$customerName.'): '.$transaction->invoice_number,
            'source_type' => 'pos_payment',
            'source_id' => $transaction->id,
            'entries' => $entries,
        ]);
    }

    /**
     * Auto-Journaling untuk Penerimaan Pembelian (Goods Receipt - P2P)
     * Debit: 113 - Persediaan Barang
     * Kredit: 211 - Hutang Usaha
     */
    public function generatePurchaseReceiptJournal($purchase): void
    {
        $tenantId = $purchase->tenant_id;
        $branchId = $purchase->branch_id;

        $this->generateDefaultCOA($tenantId, $branchId);
        $accounts = Account::where('tenant_id', $tenantId)->get()->keyBy('code');

        $supplierName = $purchase->supplier ? $purchase->supplier->name : 'Supplier Umum';

        $entries = [
            [
                'account_id' => $accounts['113']->id, // Persediaan Barang (Aset) bertambah
                'debit' => $purchase->total_cost,
                'credit' => 0,
                'description' => 'Penerimaan Barang PO: '.$purchase->invoice_number.' ('.$supplierName.')',
            ],
            [
                'account_id' => $accounts['211']->id, // Hutang Usaha bertambah
                'debit' => 0,
                'credit' => $purchase->total_cost,
                'description' => 'Tagihan Hutang PO: '.$purchase->invoice_number.' ('.$supplierName.')',
            ],
        ];

        $this->storeManualJournal([
            'branch_id' => $branchId,
            'reference_number' => null,
            'date' => $purchase->purchase_date ? $purchase->purchase_date->toDateString() : now()->toDateString(),
            'description' => 'Auto-Journal Penerimaan Pembelian ('.$supplierName.'): '.$purchase->invoice_number,
            'source_type' => 'purchase_receipt',
            'source_id' => $purchase->id,
            'entries' => $entries,
        ]);
    }

    /**
     * Auto-Journaling untuk Pembayaran Pembelian (DP / Cicilan - P2P)
     * Debit: 211 - Hutang Usaha
     * Kredit: 111 - Kas & Bank
     */
    public function generatePurchasePaymentJournal($payment, $purchase): void
    {
        $tenantId = $purchase->tenant_id;
        $branchId = $purchase->branch_id;

        $this->generateDefaultCOA($tenantId, $branchId);
        $accounts = Account::where('tenant_id', $tenantId)->get()->keyBy('code');

        $supplierName = $purchase->supplier ? $purchase->supplier->name : 'Supplier Umum';

        $entries = [
            [
                'account_id' => $accounts['211']->id, // Hutang Usaha berkurang
                'debit' => $payment->amount,
                'credit' => 0,
                'description' => 'Pelunasan/DP PO: '.$purchase->invoice_number.' ('.$supplierName.')',
            ],
            [
                'account_id' => $accounts['111']->id, // Kas & Bank berkurang
                'debit' => 0,
                'credit' => $payment->amount,
                'description' => 'Pembayaran PO: '.$purchase->invoice_number.' ('.$supplierName.')',
            ],
        ];

        $this->storeManualJournal([
            'branch_id' => $branchId,
            'reference_number' => null,
            'date' => $payment->payment_date ? $payment->payment_date->toDateString() : now()->toDateString(),
            'description' => 'Auto-Journal Pembayaran PO ('.$supplierName.'): '.$purchase->invoice_number,
            'source_type' => 'purchase_payment',
            'source_id' => $payment->id,
            'entries' => $entries,
        ]);
    }
}

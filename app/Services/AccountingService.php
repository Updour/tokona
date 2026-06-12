<?php

namespace App\Services;

use App\Models\Journal;
use App\Models\JournalEntry;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
            if (empty($tenantId) && !empty($branchId)) {
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
                throw new \InvalidArgumentException("Total Debit (" . number_format($totalDebit, 2) . ") tidak seimbang dengan Total Kredit (" . number_format($totalCredit, 2) . ")");
            }

            // Simpan Induk Jurnal
            $journal = Journal::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'reference_number' => $data['reference_number'] ?? null, // Jika null akan auto-generate di model
                'date' => $data['date'],
                'description' => $data['description'],
                'source_type' => 'manual_journal',
                'source_id' => null,
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
}

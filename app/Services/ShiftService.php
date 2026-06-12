<?php

namespace App\Services;

use App\Models\CashRegisterShift;
use App\Models\Transaction;
use App\Models\Expense;
use App\Models\CashBook;
use App\Models\Branch;
use App\Services\AccountingService;
use RuntimeException;
use Illuminate\Support\Facades\DB;

class ShiftService
{
    public function __construct(
        private readonly AccountingService $accountingService
    ) {}
    // =========================================================================
    // Query — data untuk halaman daftar shift
    // =========================================================================

    public function getShiftListData(array $filters): array
    {
        $query = CashRegisterShift::with(['user:id,name', 'branch:id,name'])
            ->withCount('transactions');

        if (!empty($filters['status']) && $filters['status'] !== 'ALL') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$filters['search']}%"));
        }

        $shifts = $query
            ->orderByDesc('opened_at')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        return [
            'shifts'  => $shifts,
            'filters' => collect($filters)->only(['search', 'status', 'per_page'])->toArray(),
        ];
    }

    // =========================================================================
    // Active Shift — cek shift yang sedang berjalan untuk kasir ini
    // =========================================================================

    public function getActiveShift(): ?CashRegisterShift
    {
        return CashRegisterShift::open()
            ->where('user_id', auth()->id())
            ->latest('opened_at')
            ->first();
    }

    // =========================================================================
    // Open Shift — buka laci kas baru
    // =========================================================================

    public function openShift(array $data): CashRegisterShift
    {
        // Pastikan tidak ada shift yang masih terbuka untuk kasir ini
        $existing = $this->getActiveShift();
        if ($existing) {
            throw new RuntimeException('Masih ada shift yang belum ditutup.');
        }

        $branchId = $data['branch_id'] ?? auth()->user()->branch_id;
        $tenantId = auth()->check() ? auth()->user()->tenant_id : null;

        // Fallback jika branch_id atau tenant_id kosong (misal login sebagai superadmin)
        if (empty($branchId) || empty($tenantId)) {
            $fallbackBranch = Branch::first();
            if ($fallbackBranch) {
                if (empty($branchId)) {
                    $branchId = $fallbackBranch->id;
                }
                if (empty($tenantId)) {
                    $tenantId = $fallbackBranch->tenant_id;
                }
            }
        }

        return CashRegisterShift::create([
            'tenant_id'       => $tenantId,
            'branch_id'       => $branchId,
            'user_id'         => auth()->id(),
            'opened_at'       => now(),
            'opening_balance' => $data['opening_balance'] ?? 0,
            'notes'           => $data['notes'] ?? null,
            'status'          => 'open',
        ]);
    }

    // =========================================================================
    // Close Shift — tutup dan rekonsiliasi
    // =========================================================================

    public function closeShift(CashRegisterShift $shift, array $data): CashRegisterShift
    {
        // Hitung expected balance = opening + total penjualan kas dalam shift ini
        $cashSales = Transaction::where('shift_id', $shift->id)
            ->where('status', 'paid')
            ->where('payment_method', 'cash')
            ->sum('total');

        $expectedBalance = (float) $shift->opening_balance + (float) $cashSales;

        $shift->update([
            'closed_at'        => now(),
            'closing_balance'  => $data['closing_balance'] ?? 0,
            'expected_balance' => $expectedBalance,
            'notes'            => $data['notes'] ?? $shift->notes,
            'status'           => 'closed',
        ]);

        // AKUNTANSI KEUANGAN: Catat setoran fisik dari Laci (Shift) ke Buku Kas (Perusahaan)
        // Setoran bersih adalah uang fisik yang diserahkan dikurangi modal awal
        $actualClosing = (float) ($data['closing_balance'] ?? 0);
        $cashToDeposit = $actualClosing - (float) $shift->opening_balance;

        if ($cashToDeposit > 0) {
            CashBook::create([
                'tenant_id' => $shift->tenant_id,
                'branch_id' => $shift->branch_id,
                'type' => 'in',
                'category' => 'penjualan',
                'amount' => $cashToDeposit,
                'reference_type' => 'shift',
                'reference_id' => $shift->id,
                'note' => 'Setoran Tunai Shift Kasir: ' . auth()->user()->name,
                'created_by' => auth()->id() ?? $shift->tenant_id,
            ]);
        }

        // Jika setorannya kurang dari yang diharapkan (selisih kurang/nombok)
        // Hitung selisihnya: uang aktual dikurangi uang yang seharusnya ada
        $shortage = $expectedBalance - $actualClosing;
        if ($shortage > 0) {
            CashBook::create([
                'tenant_id' => $shift->tenant_id,
                'branch_id' => $shift->branch_id,
                'type' => 'out',
                'category' => 'selisih_kas',
                'amount' => $shortage,
                'reference_type' => 'shift',
                'reference_id' => $shift->id,
                'note' => 'Selisih Kurang Setoran Shift Kasir: ' . auth()->user()->name,
                'created_by' => auth()->id() ?? $shift->tenant_id,
            ]);
        }

        // AKUNTANSI: Double-Entry Journal untuk total penjualan selama shift ini
        try {
            // Kita harus memastikan default accounts sudah di-inisialisasi
            $this->accountingService->initializeDefaultAccounts($shift->tenant_id, $shift->branch_id);

            // Jurnal 1: Penjualan Tunai (Kas bertambah, Pendapatan bertambah)
            if ($cashSales > 0) {
                $this->accountingService->createJournal(
                    $shift->tenant_id,
                    $shift->branch_id,
                    [
                        ['account_code' => '1110', 'debit' => $cashSales, 'credit' => 0, 'description' => 'Kas dari Penjualan Tunai Shift'],
                        ['account_code' => '4110', 'debit' => 0, 'credit' => $cashSales, 'description' => 'Pendapatan Penjualan Tunai Shift'],
                    ],
                    "Jurnal Tutup Shift Kasir: " . auth()->user()->name,
                    'pos_shift',
                    $shift->id
                );
            }
        } catch (\Exception $e) {
            // Log error tapi biarkan shift tertutup agar tidak memblokir operasional
            \Illuminate\Support\Facades\Log::error('Gagal membuat jurnal shift: ' . $e->getMessage());
        }

        return $shift->fresh();
    }

    // =========================================================================
    // Summary — ringkasan performa shift
    // =========================================================================

    public function getShiftSummary(CashRegisterShift $shift): array
    {
        $transactions = Transaction::where('shift_id', $shift->id)->where('status', 'paid');

        $totalSales       = (float) $transactions->sum('total');
        $cashSales        = (float) $transactions->clone()->where('payment_method', 'cash')->sum('total');
        $nonCashSales     = $totalSales - $cashSales;
        $txCount          = $transactions->clone()->count();
        $expectedBalance  = (float) $shift->opening_balance + $cashSales;
        $difference       = $shift->closing_balance !== null ? (float) $shift->closing_balance - $expectedBalance : null;

        return [
            'shift'            => $shift->load(['user:id,name', 'branch:id,name']),
            'total_sales'      => $totalSales,
            'cash_sales'       => $cashSales,
            'non_cash_sales'   => $nonCashSales,
            'tx_count'         => $txCount,
            'expected_balance' => $expectedBalance,
            'difference'       => $difference,
        ];
    }
}

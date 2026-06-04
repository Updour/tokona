<?php

namespace App\Services;

use App\Models\CashBook;
use App\Models\Expense;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Purchase;
use App\Models\Transaction;
use App\Models\ConsignmentItem;
use App\Models\Products;
use Carbon\Carbon;

class FinanceService
{
    /**
     * Get data list and statistics for Incomes (Cash In)
     */
    public function getIncomesData(array $filters): array
    {
        $incomes = CashBook::where('type', 'in')
            ->with('branch:id,name')
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        // Calculate statistics
        $allIncomes = CashBook::where('type', 'in')->filter($filters);
        $totalIncome = (clone $allIncomes)->sum('amount');
        $thisMonthIncome = (clone $allIncomes)
            ->whereDate('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('amount');

        // Dropdown branches
        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'incomes' => $incomes,
            'branches' => $branchesQuery->get(),
            'stats' => [
                'total' => $totalIncome,
                'this_month' => $thisMonthIncome,
            ],
            'filters' => array_intersect_key($filters, array_flip(['search', 'branch_id', 'category', 'start_date', 'end_date'])),
        ];
    }

    /**
     * Store new income entry
     */
    public function storeIncomeData(array $data): CashBook
    {
        $data['type'] = 'in';
        $data['created_by'] = auth()->id();

        if (!auth()->user()->isSuperAdmin()) {
            $data['tenant_id'] = auth()->user()->tenant_id;
        } else {
            $branch = Branch::findOrFail($data['branch_id']);
            $data['tenant_id'] = $branch->tenant_id;
        }

        return CashBook::create($data);
    }

    /**
     * Get data list and statistics for Cash Ledger
     */
    public function getCashBooksData(array $filters): array
    {
        $cashBooks = CashBook::with('branch:id,name')
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        // Calculate Ledger stats
        $allCash = CashBook::filter($filters);
        
        $totalCashIn = (clone $allCash)->where('type', 'in')->sum('amount');
        $totalCashOut = (clone $allCash)->where('type', 'out')->sum('amount');
        
        // Sum total expenses
        $expensesQuery = Expense::query();
        if (isset($filters['branch_id']) && $filters['branch_id'] !== 'ALL') {
            $expensesQuery->where('branch_id', $filters['branch_id']);
        }
        $totalExpenses = $expensesQuery->sum('amount');
        
        $netBalance = $totalCashIn - ($totalCashOut + $totalExpenses);

        $branches = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branches->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'cashBooks' => $cashBooks,
            'branches' => $branches->get(),
            'stats' => [
                'cash_in' => $totalCashIn,
                'cash_out' => $totalCashOut + $totalExpenses,
                'balance' => $netBalance,
            ],
            'filters' => array_intersect_key($filters, array_flip(['search', 'branch_id', 'start_date', 'end_date'])),
        ];
    }

    /**
     * Calculate and retrieve Profit & Loss statistics and breakdown
     */
    public function getProfitLossData(array $filters): array
    {
        $year = intval($filters['year'] ?? Carbon::now()->year);
        $branchId = $filters['branch_id'] ?? 'ALL';

        // Revenue: Hanya dari CashBook IN category 'penjualan'
        $revenueQuery = CashBook::where('type', 'in')->where('category', 'penjualan')->whereYear('created_at', $year);
        if ($branchId !== 'ALL') {
            $revenueQuery->where('branch_id', $branchId);
        }
        $revenue = (clone $revenueQuery)->sum('amount');

        // HPP / COGS: Dari total_cogs di transaksi penjualan yang sukses (paid, partial, debt)
        $cogsQuery = Transaction::whereIn('status', ['paid', 'partial', 'debt'])->whereYear('created_at', $year);
        if ($branchId !== 'ALL') {
            $cogsQuery->where('branch_id', $branchId);
        }
        $cogs = (clone $cogsQuery)->sum('total_cogs');
        
        // Operational Expenses: From expenses table
        $expensesQuery = Expense::whereYear('expense_date', $year);
        if ($branchId !== 'ALL') {
            $expensesQuery->where('branch_id', $branchId);
        }
        $expenses = (clone $expensesQuery)->sum('amount');

        // Monthly Breakdown for Chart
        $monthlyBreakdown = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthName = Carbon::create($year, $m, 1)->locale('id')->isoFormat('MMM');
            
            $mRev = (clone $revenueQuery)->whereMonth('created_at', $m)->sum('amount');
            $mCogs = (clone $cogsQuery)->whereMonth('created_at', $m)->sum('total_cogs');
            $mExp = (clone $expensesQuery)->whereMonth('expense_date', $m)->sum('amount');
            $mNet = $mRev - ($mCogs + $mExp);

            $monthlyBreakdown[] = [
                'month' => $monthName,
                'revenue' => $mRev,
                'cogs' => $mCogs,
                'expenses' => $mExp,
                'net_profit' => $mNet,
            ];
        }

        $branches = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branches->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'branches' => $branches->get(),
            'stats' => [
                'year' => $year,
                'branch_id' => $branchId,
                'revenue' => $revenue,
                'cogs' => $cogs,
                'expenses' => $expenses,
                'net_profit' => $revenue - ($cogs + $expenses),
                'breakdown' => $monthlyBreakdown,
            ],
        ];
    }

    /**
     * Get Debts and Receivables listing and stats
     */
    public function getDebtsReceivablesData(): array
    {
        $receivablesQuery = Customer::where('debt_balance', '>', 0);
        $totalReceivables = $receivablesQuery->sum('debt_balance');
        $receivablesList = $receivablesQuery->orderBy('debt_balance', 'desc')->take(10)->get();

        $debtsQuery = Purchase::with('supplier:id,name')->where('status', 'received');
        $totalDebts = $debtsQuery->sum('total_cost');
        $debtsList = $debtsQuery->orderBy('total_cost', 'desc')->take(10)->get();

        // Hutang Konsinyasi (Titipan belum dibayar)
        // Diambil dari Sesi Titipan yang Selesai tapi belum Lunas, atau sesi Aktif (opsional).
        // Karena sistem kini langsung memotong kas saat Selesai, sisa yang belum disetor dianggap hutang potensial.
        $consignmentDebts = ConsignmentItem::whereHas('consignment', function($q) {
            $q->where('status', 'active');
        })->get()->sum(function($item) {
            return ($item->qty_received - $item->qty_unsold) * $item->base_cost;
        });

        return [
            'stats' => [
                'total_receivables' => $totalReceivables,
                'total_debts' => $totalDebts + $consignmentDebts,
                'net_balance' => $totalReceivables - ($totalDebts + $consignmentDebts),
                'receivables' => $receivablesList,
                'debts' => $debtsList,
            ]
        ];
    }

    /**
     * Mendapatkan data lengkap laporan akuntansi (Buku Besar, Neraca, Arus Kas)
     */
    public function getAccountingReportsData(array $filters): array
    {
        $startDate = !empty($filters['start_date']) ? Carbon::parse($filters['start_date'])->startOfDay() : Carbon::now()->startOfMonth();
        $endDate = !empty($filters['end_date']) ? Carbon::parse($filters['end_date'])->endOfDay() : Carbon::now()->endOfDay();
        $branchId = $filters['branch_id'] ?? 'ALL';

        // 1. QUERY DAN HITUNG GENERAL LEDGER (BUKU BESAR MUTASI KAS)
        $cashBooksQuery = CashBook::with('branch:id,name')
            ->whereBetween('created_at', [$startDate, $endDate]);
        
        $expensesQuery = Expense::with('branch:id,name')
            ->whereBetween('expense_date', [$startDate, $endDate]);

        $purchasesQuery = Purchase::with(['branch:id,name', 'supplier:id,name'])
            ->whereBetween('purchase_date', [$startDate, $endDate]);

        if ($branchId !== 'ALL') {
            $cashBooksQuery->where('branch_id', $branchId);
            $expensesQuery->where('branch_id', $branchId);
            $purchasesQuery->where('branch_id', $branchId);
        }

        $cashBooks = $cashBooksQuery->get();
        $expenses = $expensesQuery->get();
        $purchases = $purchasesQuery->get();

        $ledgerEntries = collect();

        // Petakan kas masuk dan keluar
        foreach ($cashBooks as $cb) {
            $ledgerEntries->push([
                'date' => $cb->created_at->toIso8601String(),
                'type' => 'Buku Kas',
                'category' => $cb->category,
                'description' => $cb->note ?? 'Pemasukan/Pengeluaran Kas',
                'branch' => $cb->branch->name ?? 'Pusat',
                'debit' => $cb->type === 'in' ? floatval($cb->amount) : 0,
                'credit' => $cb->type === 'out' ? floatval($cb->amount) : 0,
            ]);
        }

        // Petakan biaya operasional
        foreach ($expenses as $exp) {
            $ledgerEntries->push([
                'date' => Carbon::parse($exp->expense_date)->toIso8601String(),
                'type' => 'Biaya',
                'category' => $exp->category,
                'description' => $exp->title . ($exp->note ? ' (' . $exp->note . ')' : ''),
                'branch' => $exp->branch->name ?? 'Pusat',
                'debit' => 0,
                'credit' => floatval($exp->amount),
            ]);
        }

        // Petakan pembelian stok barang
        foreach ($purchases as $p) {
            $ledgerEntries->push([
                'date' => Carbon::parse($p->purchase_date)->toIso8601String(),
                'type' => 'Pembelian',
                'category' => 'HPP Pembelian',
                'description' => 'Pembelian ke ' . ($p->supplier->name ?? 'Pemasok') . ' - Status: ' . $p->status,
                'branch' => $p->branch->name ?? 'Pusat',
                'debit' => 0,
                'credit' => floatval($p->total_cost),
            ]);
        }

        // Urutkan secara kronologis berdasarkan tanggal
        $ledgerEntries = $ledgerEntries->sortBy('date')->values();

        // Hitung saldo berjalan (running balance)
        $runningBalance = 0;
        $ledgerWithBalance = $ledgerEntries->map(function ($entry) use (&$runningBalance) {
            $runningBalance += $entry['debit'] - $entry['credit'];
            $entry['balance'] = $runningBalance;
            return $entry;
        });

        // 2. HITUNG NERACA (BALANCE SHEET)
        // Aktiva: Kas Cair, Piutang Pelanggan, Nilai Persediaan Stok
        $cashIn = CashBook::where('type', 'in');
        $cashOut = CashBook::where('type', 'out');
        $totalExp = Expense::query();
        $purchasesPaid = Purchase::where('status', 'paid');
        
        if ($branchId !== 'ALL') {
            $cashIn->where('branch_id', $branchId);
            $cashOut->where('branch_id', $branchId);
            $totalExp->where('branch_id', $branchId);
            $purchasesPaid->where('branch_id', $branchId);
        }

        $cashBalance = $cashIn->sum('amount') - ($cashOut->sum('amount') + $totalExp->sum('amount') + $purchasesPaid->sum('total_cost'));
        if ($cashBalance < 0) {
            $cashBalance = 0;
        }

        // Piutang Pelanggan
        $receivablesQuery = Customer::query();
        $totalReceivables = $receivablesQuery->sum('debt_balance');

        // Nilai Persediaan Aktif
        $inventoryQuery = Products::withCurrentStock();
        if ($branchId !== 'ALL') {
            $inventoryQuery->where('branch_id', $branchId);
        }
        $totalInventoryValue = $inventoryQuery->get()->sum(fn($p) => floatval($p->base_cost) * floatval($p->current_stock));

        $totalAssets = $cashBalance + $totalReceivables + $totalInventoryValue;

        // Pasiva: Hutang Pemasok & Laba/Rugi Ditahan & Modal Usaha
        $debtsQuery = Purchase::where('status', 'received');
        if ($branchId !== 'ALL') {
            $debtsQuery->where('branch_id', $branchId);
        }
        $totalDebts = $debtsQuery->sum('total_cost');

        // Laba Ditahan = Pendapatan Penjualan - HPP Penjualan - Biaya
        $revenueQuery = CashBook::where('type', 'in')->where('category', 'penjualan');
        $cogsQuery = Transaction::whereIn('status', ['paid', 'partial', 'debt']);
        
        if ($branchId !== 'ALL') {
            $revenueQuery->where('branch_id', $branchId);
            $cogsQuery->where('branch_id', $branchId);
        }
        
        $revenue = $revenueQuery->sum('amount');
        $totalCogs = $cogsQuery->sum('total_cogs');
        $retainedEarnings = $revenue - ($totalCogs + $totalExp->sum('amount'));

        // Modal Pemilik
        $ownerEquity = $totalAssets - ($totalDebts + $retainedEarnings);
        if ($ownerEquity < 0) {
            $ownerEquity = 0;
        }

        // 3. HITUNG LAPORAN ARUS KAS (CASH FLOW STATEMENT)
        // Arus Kas Operasional
        $opCashIn = $revenue;
        $opCashOut = $totalExp->sum('amount') + $totalCogs;
        $operatingCashFlow = $opCashIn - $opCashOut;

        // Arus Kas Investasi
        $invCashIn = CashBook::where('type', 'in')->where('category', 'investasi');
        $invCashOut = CashBook::where('type', 'out')->where('category', 'investasi');
        if ($branchId !== 'ALL') {
            $invCashIn->where('branch_id', $branchId);
            $invCashOut->where('branch_id', $branchId);
        }
        $investingCashFlow = $invCashIn->sum('amount') - $invCashOut->sum('amount');

        // Arus Kas Pendanaan
        $finCashIn = CashBook::where('type', 'in')->where('category', 'pendanaan');
        $finCashOut = CashBook::where('type', 'out')->where('category', 'pendanaan');
        if ($branchId !== 'ALL') {
            $finCashIn->where('branch_id', $branchId);
            $finCashOut->where('branch_id', $branchId);
        }
        $financingCashFlow = $finCashIn->sum('amount') - $finCashOut->sum('amount');

        $netCashFlow = $operatingCashFlow + $investingCashFlow + $financingCashFlow;

        $branches = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branches->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'ledger' => $ledgerWithBalance,
            'balanceSheet' => [
                'assets' => [
                    'cash' => $cashBalance,
                    'receivables' => $totalReceivables,
                    'inventory' => $totalInventoryValue,
                    'total' => $totalAssets,
                ],
                'liabilities' => [
                    'payables' => $totalDebts,
                    'total' => $totalDebts,
                ],
                'equity' => [
                    'retained_earnings' => $retainedEarnings,
                    'owner_equity' => $ownerEquity,
                    'total' => $retainedEarnings + $ownerEquity,
                ],
                'total_pasiva' => $totalDebts + $retainedEarnings + $ownerEquity,
            ],
            'cashFlow' => [
                'operating' => $operatingCashFlow,
                'investing' => $investingCashFlow,
                'financing' => $financingCashFlow,
                'net' => $netCashFlow,
            ],
            'branches' => $branches->get(),
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'branch_id' => $branchId,
            ]
        ];
    }
}

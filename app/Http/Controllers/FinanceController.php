<?php

namespace App\Http\Controllers;

use App\Models\CashBook;
use App\Services\FinanceService;
use App\Http\Requests\Finance\StoreIncomeRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FinanceController extends Controller
{
    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    /**
     * Pemasukan (Cash In)
     */
    public function incomes(Request $request): Response
    {
        $data = $this->financeService->getIncomesData($request->all());
        return Inertia::render('finance/incomes', $data);
    }

    /**
     * Store Pemasukan
     */
    public function storeIncome(StoreIncomeRequest $request): RedirectResponse
    {
        $this->financeService->storeIncomeData($request->validated());

        return redirect()->back()->with('success', 'Pemasukan baru berhasil dicatat.');
    }

    /**
     * Kas & Saldo (Cash Ledger)
     */
    public function cashBooks(Request $request): Response
    {
        $data = $this->financeService->getCashBooksData($request->all());
        return Inertia::render('finance/cash-books', $data);
    }

    /**
     * Laporan Laba Rugi (Profit & Loss)
     */
    public function profitLoss(Request $request): Response
    {
        $data = $this->financeService->getProfitLossData($request->all());
        return Inertia::render('finance/profit-loss', $data);
    }

    /**
     * Hutang & Piutang (Accounts Payable & Receivable)
     */
    public function debtsReceivables(Request $request): Response
    {
        $data = $this->financeService->getDebtsReceivablesData();
        return Inertia::render('finance/debts-receivables', $data);
    }

    /**
     * Hapus Catatan Kas
     */
    public function destroyCashBook(CashBook $cashBook): RedirectResponse
    {
        $cashBook->delete();
        return redirect()->back()->with('success', 'Catatan keuangan berhasil dihapus.');
    }

    /**
     * Laporan Akuntansi Lengkap (Buku Besar, Neraca, Arus Kas)
     */
    public function accountingReports(Request $request): Response
    {
        $data = $this->financeService->getAccountingReportsData($request->all());
        return Inertia::render('finance/accounting-reports', $data);
    }
}

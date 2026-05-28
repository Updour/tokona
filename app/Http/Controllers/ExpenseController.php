<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\ExpenseService;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ExpenseController extends Controller
{
    protected ExpenseService $expenseService;

    public function __construct(ExpenseService $expenseService)
    {
        $this->expenseService = $expenseService;
    }

    public function index(Request $request): Response
    {
        $data = $this->expenseService->getExpenseListData($request->all());
        return Inertia::render('expenses/index', $data);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $this->expenseService->storeExpenseData($request->validated());

        return redirect()->back()
            ->with('success', 'Pengeluaran baru berhasil dicatat.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->expenseService->updateExpenseData($expense, $request->validated());

        return redirect()->back()
            ->with('success', 'Catatan pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->back()
            ->with('success', 'Catatan pengeluaran berhasil dihapus.');
    }
}

<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Branch;
use Carbon\Carbon;

class ExpenseService
{
    public function getExpenseListData(array $filters): array
    {
        $expenses = Expense::with('branch:id,name')
            ->filter($filters)
            ->orderBy('expense_date', 'desc')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        // Calculate statistics for the dashboard
        $allExpensesQuery = Expense::filter($filters);

        // Get total amount
        $totalAmount = (clone $allExpensesQuery)->sum('amount');
        
        // Get this month amount
        $currentMonthStart = Carbon::now()->startOfMonth();
        $totalThisMonth = (clone $allExpensesQuery)
            ->whereDate('expense_date', '>=', $currentMonthStart)
            ->sum('amount');

        // Get expense categories summary
        $byCategory = (clone $allExpensesQuery)
            ->selectRaw('category, sum(amount) as total')
            ->groupBy('category')
            ->get()
            ->pluck('total', 'category')
            ->toArray();

        // Branches dropdown options
        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchesQuery->get();

        return [
            'expenses' => $expenses,
            'branches' => $branches,
            'stats' => [
                'total' => $totalAmount,
                'this_month' => $totalThisMonth,
                'by_category' => $byCategory,
            ],
            'filters' => array_intersect_key($filters, array_flip(['search', 'branch_id', 'category', 'start_date', 'end_date'])),
        ];
    }

    public function storeExpenseData(array $data): Expense
    {
        if (!auth()->user()->isSuperAdmin()) {
            $data['tenant_id'] = auth()->user()->tenant_id;
        } else {
            // Super Admin gets the tenant of the branch
            $branch = Branch::findOrFail($data['branch_id']);
            $data['tenant_id'] = $branch->tenant_id;
        }

        return Expense::create($data);
    }

    public function updateExpenseData(Expense $expense, array $data): bool
    {
        return $expense->update($data);
    }
}

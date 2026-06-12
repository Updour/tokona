<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Branch;
use App\Models\Tenants;
use App\Models\Account;
use App\Services\AccountingService;
use App\Http\Requests\Finance\StoreJournalRequest;
use Illuminate\Http\RedirectResponse;

class AccountingController extends Controller
{
    protected AccountingService $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }
    public function journals(Request $request)
    {
        $query = Journal::with(['entries.account', 'creator', 'branch'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('reference_number', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }
        
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        
        if (auth()->user()->isSuperAdmin() && $request->filled('tenant_id')) {
            // Because tenant scope is auto applied, we should use withoutGlobalScope if we want cross tenant
            // Or just rely on the fact that SuperAdmin bypasses the global scope
            $query->where('tenant_id', $request->tenant_id);
        }

        $journals = $query->paginate($request->get('per_page', 15));

        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        $accountsQuery = Account::where('is_active', true)->orderBy('code');
        if (!auth()->user()->isSuperAdmin()) {
            $accountsQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return Inertia::render('finance/accounting/journals/Index', [
            'journals' => $journals,
            'accounts' => $accountsQuery->get(),
            'filters' => $request->only(['search', 'branch_id', 'tenant_id']),
            'branches' => $branchesQuery->get(),
            'tenants' => auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->orderBy('name')->get() : null,
            'is_super_admin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    /**
     * Store Manual Journal
     */
    public function storeJournal(StoreJournalRequest $request): RedirectResponse
    {
        try {
            $this->accountingService->storeManualJournal($request->validated());
            return redirect()->back()->with('success', 'Jurnal manual berhasil dicatat.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['entries' => $e->getMessage()]);
        }
    }

    /**
     * Delete Journal
     */
    public function destroyJournal(Journal $journal): RedirectResponse
    {
        $this->accountingService->destroyJournal($journal);
        return redirect()->back()->with('success', 'Jurnal berhasil dihapus.');
    }
}

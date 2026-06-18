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
        
        if ($request->filled('tenant_id')) {
            if (auth()->user()->isSuperAdmin()) {
                $query->where('tenant_id', $request->tenant_id);
            }
        }

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->start_date . ' 00:00:00');
        }
        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->end_date . ' 23:59:59');
        }

        $journals = $query->paginate($request->get('per_page', 15))->withQueryString();

        $branchesQuery = Branch::select('id', 'name', 'tenant_id')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        $accountsQuery = Account::with('tenant:id,name')->where('is_active', true)->orderBy('code');
        
        $targetTenantId = auth()->user()->isSuperAdmin() ? $request->tenant_id : auth()->user()->tenant_id;

        if ($targetTenantId) {
            $accountsQuery->where('tenant_id', $targetTenantId);
            
            // Auto generate COA jika kosong untuk tenant ini
            if (Account::where('tenant_id', $targetTenantId)->count() === 0) {
                app(AccountingService::class)->generateDefaultCOA($targetTenantId);
            }
        } elseif (auth()->user()->isSuperAdmin()) {
             // Jika super admin belum pilih tenant, jangan tampilkan semua akun (bisa ribuan duplikat)
             // Atau tampilkan saja beberapa dengan limit
             $accountsQuery->limit(100);
        }

        return inertia('finance/accounting/journals/Index', [
            'journals' => $journals,
            'filters' => $request->all(['search', 'branch_id', 'tenant_id', 'start_date', 'end_date', 'per_page']),
            'accounts' => $accountsQuery->get(),
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

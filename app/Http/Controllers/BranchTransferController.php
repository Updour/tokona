<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreBranchTransferRequest;
use App\Http\Requests\Inventory\ReceiveBranchTransferRequest;
use App\Models\BranchTransfer;
use App\Models\Branch;
use App\Models\Tenants;
use App\Models\Products;
use App\Services\BranchTransferService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchTransferController extends Controller
{
    protected BranchTransferService $transferService;

    public function __construct(BranchTransferService $transferService)
    {
        $this->transferService = $transferService;
    }

    public function index(Request $request)
    {
        $filters = $request->all();
        
        // Add global scopes for super admin if needed
        if (auth()->user()->isSuperAdmin() && $request->filled('tenant_id')) {
            $filters['tenant_id'] = $request->tenant_id;
        }

        $transfers = $this->transferService->getTransfers($filters);

        $branchesQuery = Branch::query();
        $productsQuery = Products::withCurrentStock()->orderBy('name');
        
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
            $productsQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return Inertia::render('inventory/transfers/Index', [
            'transfers' => $transfers,
            'branches' => $branchesQuery->get(),
            'products' => $productsQuery->get(),
            'filters' => $request->only(['search', 'status', 'branch_id', 'tenant_id', 'date_from', 'date_to']),
            'tenants' => auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->orderBy('name')->get() : null,
            'is_super_admin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function store(StoreBranchTransferRequest $request)
    {
        try {
            $this->transferService->createTransfer($request->validated());
            return redirect()->back()->with('success', 'Transfer antar cabang berhasil dibuat (DRAFT).');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat transfer: ' . $e->getMessage());
        }
    }

    public function ship(BranchTransfer $transfer)
    {
        try {
            $this->transferService->shipTransfer($transfer);
            return redirect()->back()->with('success', 'Transfer berhasil dikirim (SHIPPED).');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengirim transfer: ' . $e->getMessage());
        }
    }

    public function receive(ReceiveBranchTransferRequest $request, BranchTransfer $transfer)
    {
        try {
            $this->transferService->receiveTransfer($transfer, $request->validated('items'));
            return redirect()->back()->with('success', 'Penerimaan transfer berhasil dicatat.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mencatat penerimaan: ' . $e->getMessage());
        }
    }
}

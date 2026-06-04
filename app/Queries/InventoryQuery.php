<?php

namespace App\Queries;

use App\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class InventoryQuery
{
    public function __construct(private readonly Request $request) {}

    public function indexData(): array
    {
        $movements = $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();

        $branchesQuery = \App\Models\Branch::query()->select('id', 'name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return [
            'movements' => $movements,
            'branches'  => $branchesQuery->orderBy('name')->get(),
            'filters'   => $this->request->only(['search', 'type', 'branch_id', 'start_date', 'end_date']),
        ];
    }

    private function build()
    {
        $query = StockMovement::with(['product:id,name,sku,barcode', 'branch:id,name']);

        $this->applyTenantFilter($query);
        $this->applySearch($query);
        $this->applyTypeFilter($query);
        $this->applyBranchFilter($query);
        $this->applyDateFilter($query);
        $this->applySort($query);

        return $query;
    }

    private function applyTenantFilter($query): void
    {
        // Global scope on StockMovement usually handles tenant isolation for non-superadmins.
        // But we can double check or allow super admins to filter by tenant in the future.
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $search = $this->request->input('search');
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
    }

    private function applyTypeFilter($query): void
    {
        if ($this->request->filled('type') && $this->request->input('type') !== 'ALL') {
            $query->where('type', $this->request->input('type'));
        }
    }

    private function applyBranchFilter($query): void
    {
        if ($this->request->filled('branch_id') && $this->request->input('branch_id') !== 'ALL') {
            $query->where('branch_id', $this->request->input('branch_id'));
        }
    }

    private function applyDateFilter($query): void
    {
        if ($this->request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $this->request->input('start_date'));
        }
        if ($this->request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $this->request->input('end_date'));
        }
    }

    private function applySort($query): void
    {
        $query->orderBy('created_at', 'desc');
    }
}

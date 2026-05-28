<?php

namespace App\Queries;

use App\Models\Purchase;
use Illuminate\Http\Request;

class PurchaseQuery
{
    public function __construct(private readonly Request $request) {}

    public function indexData(): array
    {
        $purchases = $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();

        $branches = \App\Models\Branch::select('id', 'name')->orderBy('name')->get();

        return [
            'purchases' => $purchases,
            'branches'  => $branches,
            'filters'   => $this->request->only(['search', 'status', 'branch_id', 'start_date', 'end_date']),
        ];
    }

    private function build()
    {
        // Load jumlah item dan total harga agar efisien di halaman Index
        $query = Purchase::with(['branch:id,name'])->withCount('items');

        $this->applySearch($query);
        $this->applyStatusFilter($query);
        $this->applyBranchFilter($query);
        $this->applyDateFilter($query);
        $this->applySort($query);

        return $query;
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $search = $this->request->input('search');
            $query->where('invoice_number', 'like', "%{$search}%");
        }
    }

    private function applyStatusFilter($query): void
    {
        if ($this->request->filled('status') && $this->request->input('status') !== 'ALL') {
            $query->where('status', $this->request->input('status'));
        }
    }

    private function applyBranchFilter($query): void
    {
        if ($this->request->filled('branch_id') && $this->request->input('branch_id') !== 'ALL') {
            $query->where('branch_id', $this->request->input('branch_id'));
        }
    }

    private function applySort($query): void
    {
        $query->orderBy('created_at', 'desc');
    }

    private function applyDateFilter($query): void
    {
        if ($this->request->filled('start_date')) {
            $query->whereDate('purchase_date', '>=', $this->request->input('start_date'));
        }
        if ($this->request->filled('end_date')) {
            $query->whereDate('purchase_date', '<=', $this->request->input('end_date'));
        }
    }
}

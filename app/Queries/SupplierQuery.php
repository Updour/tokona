<?php

namespace App\Queries;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierQuery
{
    public function __construct(private readonly Request $request) {}

    public function indexData(): array
    {
        $suppliers = $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();

        return [
            'suppliers' => $suppliers,
            'filters'   => $this->request->only(['search', 'status']),
        ];
    }

    private function build()
    {
        $query = Supplier::query();
        $this->applySearch($query);
        $this->applyStatusFilter($query);
        $query->orderBy('name', 'asc');
        return $query;
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $search = $this->request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
    }

    private function applyStatusFilter($query): void
    {
        if ($this->request->filled('status') && $this->request->input('status') !== 'ALL') {
            $query->where('status', $this->request->input('status'));
        }
    }
}

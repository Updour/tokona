<?php

namespace App\Queries;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerQuery
{
    public function __construct(private readonly Request $request) {}

    public function indexData(): array
    {
        $customers = $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();

        return [
            'customers' => $customers,
            'filters'   => $this->request->only(['search', 'tier']),
        ];
    }

    private function build()
    {
        $query = Customer::query();
        $this->applySearch($query);
        $this->applyTierFilter($query);
        $query->orderBy('created_at', 'desc');
        return $query;
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $search = $this->request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
    }

    private function applyTierFilter($query): void
    {
        if ($this->request->filled('tier') && $this->request->input('tier') !== 'ALL') {
            $query->where('tier', $this->request->input('tier'));
        }
    }
}

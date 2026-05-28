<?php

namespace App\Queries;

use App\Models\Promo;
use Illuminate\Http\Request;

class PromoQuery
{
    public function __construct(private readonly Request $request) {}

    public function indexData(): array
    {
        $promos = $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();

        return [
            'promos'  => $promos,
            'filters' => $this->request->only(['search', 'type', 'status']),
        ];
    }

    private function build()
    {
        $query = Promo::query();
        $this->applySearch($query);
        $this->applyTypeFilter($query);
        $this->applyStatusFilter($query);
        $query->orderBy('created_at', 'desc');
        return $query;
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $search = $this->request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }
    }

    private function applyTypeFilter($query): void
    {
        if ($this->request->filled('type') && $this->request->input('type') !== 'ALL') {
            $query->where('type', $this->request->input('type'));
        }
    }

    private function applyStatusFilter($query): void
    {
        if ($this->request->filled('status') && $this->request->input('status') !== 'ALL') {
            $isActive = $this->request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }
    }
}

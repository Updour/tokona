<?php

namespace App\Queries;

use App\Models\Products;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * ProductQuery
 *
 * Bertanggung jawab membangun query daftar produk dari parameter request.
 * Semua filter dan sort didelegasikan ke model scopes.
 * Controller dan Service tidak perlu tahu detail SQL-nya.
 */
class ProductQuery
{
    private const ALLOWED_SORTS = [
        'name', 'sku', 'sell_price', 'base_cost',
        'created_at', 'is_active', 'current_stock',
    ];

    private const FILTER_KEYS = [
        'search', 'sort', 'direction', 'per_page',
        'category_id', 'type_id', 'is_active', 'low_stock',
        'date_from', 'date_to', 'tenant_id', 'branch_id',
        'price_min', 'price_max',
    ];

    public function __construct(private readonly Request $request) {}

    /** Jalankan query dan kembalikan hasil paginasi. */
    public function paginate(): LengthAwarePaginator
    {
        return $this->build()
            ->paginate($this->request->integer('per_page', 15))
            ->withQueryString();
    }

    /** Kembalikan array key filter yang aktif dari request. */
    public function activeFilters(): array
    {
        return $this->request->only(self::FILTER_KEYS);
    }

    // ─── Builder ──────────────────────────────────────────────────────────────

    private function build()
    {
        $query = Products::withListRelations()
            ->withCurrentStock();

        $this->applyTenantFilter($query);
        $this->applyBranchFilter($query);
        $this->applySearch($query);
        $this->applyCategoryFilter($query);
        $this->applyTypeFilter($query);
        $this->applyStatusFilter($query);
        $this->applyDateRange($query);
        $this->applyLowStockFilter($query);
        $this->applyPriceRange($query);
        $this->applySort($query);

        return $query;
    }

    // ─── Filter methods ───────────────────────────────────────────────────────

    private function applyTenantFilter($query): void
    {
        // Super admin bisa filter lintas tenant; user biasa sudah di-handle global scope
        if (auth()->user()->isSuperAdmin() && $this->request->filled('tenant_id')) {
            $query->where('products.tenant_id', $this->request->input('tenant_id'));
        }
    }

    private function applyBranchFilter($query): void
    {
        if ($this->request->filled('branch_id')) {
            $query->where('products.branch_id', $this->request->input('branch_id'));
        }
    }

    private function applySearch($query): void
    {
        if ($this->request->filled('search')) {
            $query->search($this->request->input('search'));
        }
    }

    private function applyCategoryFilter($query): void
    {
        if ($this->request->filled('category_id')) {
            $query->where('products.category_id', $this->request->input('category_id'));
        }
    }

    private function applyTypeFilter($query): void
    {
        if ($this->request->filled('type_id')) {
            $query->where('products.type_id', $this->request->input('type_id'));
        }
    }

    private function applyStatusFilter($query): void
    {
        if ($this->request->filled('is_active')) {
            $query->where(
                'products.is_active',
                filter_var($this->request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            );
        }
    }

    private function applyDateRange($query): void
    {
        $query->createdBetween(
            $this->request->input('date_from'),
            $this->request->input('date_to')
        );
    }

    private function applyLowStockFilter($query): void
    {
        if ($this->request->boolean('low_stock')) {
            $query->lowStock();
        }
    }

    private function applyPriceRange($query): void
    {
        $query->priceBetween(
            $this->request->input('price_min'),
            $this->request->input('price_max')
        );
    }

    private function applySort($query): void
    {
        $field     = $this->request->input('sort', 'created_at');
        $direction = $this->request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        if (!in_array($field, self::ALLOWED_SORTS)) {
            $query->orderBy('products.created_at', 'desc');
            return;
        }

        $column = $field === 'current_stock'
            ? DB::raw('COALESCE(sm.current_stock, 0)')
            : "products.{$field}";

        $query->orderBy($column, $direction);
    }
}

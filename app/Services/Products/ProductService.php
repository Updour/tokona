<?php

namespace App\Services\Products;

use App\Models\Branch;
use App\Models\ProductCategory;
use App\Models\Products;
use App\Models\ProductType;
use App\Models\Tenants;
use App\Queries\ProductQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * ProductService
 *
 * Bertanggung jawab atas business logic produk.
 * Tidak ada raw SQL atau query builder di sini —
 * semua query didelegasikan ke Model scopes dan ProductQuery.
 */
class ProductService
{
    public function __construct(
        private readonly ProductImageService $imageService
    ) {}

    // =========================================================================
    // Index — kumpulkan data untuk halaman daftar produk
    // =========================================================================

    public function indexData(Request $request): array
    {
        $query = new ProductQuery($request);

        return [
            'products'       => $query->paginate(),
            'categories'     => ProductCategory::forDropdown()->get(),
            'types'          => ProductType::forDropdown()->get(),
            'branches'       => $this->branchesForForm(),
            'tenants'        => $this->tenantsForForm(),
            'is_super_admin' => auth()->user()->isSuperAdmin(),
            'filters'        => $query->activeFilters(),
        ];
    }

    // =========================================================================
    // CRUD
    // =========================================================================

    public function create(array $data): Products
    {
        if (!auth()->user()->isSuperAdmin()) {
            $data['tenant_id'] = auth()->user()->tenant_id;
        }

        $images = $data['images'] ?? [];
        unset($data['images']);

        $product = Products::create($data);

        $this->recordInitialStock($product, (int) ($data['initial_stock'] ?? 0));

        if (!empty($images)) {
            $this->imageService->upload($product->id, $images);
        }

        return $product;
    }

    public function update(Products $product, array $data): Products
    {
        unset($data['tenant_id'], $data['initial_stock']);

        $product->update($data);

        return $product->fresh();
    }

    public function delete(Products $product, bool $force = false): string
    {
        if ($force) {
            // Hapus semua gambar — file fisik dihapus via ProductImage::booted()
            $product->images()->each(fn ($img) => $img->delete());
            $product->forceDelete();
        } else {
            $product->delete();
        }

        return $product->name;
    }

    public function restore(string $id): string
    {
        $product = Products::withTrashed()->findOrFail($id);
        $product->restore();

        return $product->name;
    }

    /**
     * Melakukan kenaikan harga jual produk secara massal berdasarkan filter kategori dan cabang
     */
    public function bulkMarkup(array $filters): int
    {
        $query = Products::query();

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        $type = $filters['markup_type'];
        $val = floatval($filters['markup_value']);

        $products = $query->get();
        foreach ($products as $product) {
            if ($type === 'percentage') {
                $product->sell_price = $product->sell_price * (1 + ($val / 100));
            } else {
                $product->sell_price = $product->sell_price + $val;
            }
            
            // Validasi harga jual minimum agar tidak melampaui harga jual baru
            if ($product->min_sell_price > $product->sell_price) {
                $product->min_sell_price = $product->sell_price;
            }
            $product->save();
        }

        return count($products);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private function recordInitialStock(Products $product, int $qty): void
    {
        if ($qty <= 0) {
            return;
        }

        $product->recordStockMovement('IN', $qty, [
            'source_type' => 'initial',
            'notes'       => 'Stok awal saat produk dibuat',
        ]);
    }

    // =========================================================================
    // Low Stock — data untuk halaman stok kritis
    // =========================================================================

    public function getLowStockCount(): int
    {
        return Products::withCurrentStock()
            ->lowStock()
            ->active()
            ->count();
    }

    public function getLowStockData(array $filters): array
    {
        $query = Products::withCurrentStock()
            ->withListRelations()
            ->lowStock()
            ->active();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        $products = $query
            ->orderBy(DB::raw('COALESCE(sm.current_stock, 0)'), 'asc')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        return [
            'products' => $products,
            'filters'  => collect($filters)->only(['search', 'per_page'])->toArray(),
        ];
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private function branchesForForm()
    {
        $query = Branch::forDropdown();

        if (!auth()->user()->isSuperAdmin()) {
            $query->forTenant(auth()->user()->tenant_id);
        }

        return $query->get();
    }

    private function tenantsForForm()
    {
        return auth()->user()->isSuperAdmin()
            ? Tenants::forDropdown()->get()
            : null;
    }
}

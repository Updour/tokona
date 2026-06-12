<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = ProductCategory::query()
            ->when($request->filled('search'), fn ($q) =>
                $q->where('name', 'like', '%' . $request->input('search') . '%')
            )
            ->when(
                in_array($request->input('sort'), ['name', 'created_at']),
                fn ($q) => $q->orderBy($request->input('sort'), $request->input('direction', 'asc') === 'asc' ? 'asc' : 'desc'),
                fn ($q) => $q->orderBy('name')
            )
            ->withCount('products')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('product-categories/Index', [
            'categories' => $categories,
            'filters'    => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;
        if (!$tenantId && auth()->user()->isSuperAdmin()) {
            $tenantId = \App\Models\Tenants::first()->id ?? null;
        }

        ProductCategory::create(array_merge(
            $request->validated(),
            ['tenant_id' => $tenantId]
        ));

        return redirect()->route('product-categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(StoreProductCategoryRequest $request, string $id): RedirectResponse
    {
        $category = ProductCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        $category->update($request->validated());

        return redirect()->route('product-categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $category = ProductCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        if ($category->products()->exists()) {
            return back()->with('error', 'Kategori tidak bisa dihapus karena masih digunakan oleh produk.');
        }

        $category->delete();

        return redirect()->route('product-categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductTypeRequest;
use App\Models\ProductType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $types = ProductType::query()
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

        return Inertia::render('product-types/Index', [
            'types'   => $types,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function store(StoreProductTypeRequest $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;
        if (!$tenantId && auth()->user()->isSuperAdmin()) {
            $tenantId = \App\Models\Tenants::first()->id ?? null;
        }

        ProductType::create(array_merge(
            $request->validated(),
            ['tenant_id' => $tenantId]
        ));

        return redirect()->route('product-types.index')
            ->with('success', 'Tipe produk berhasil ditambahkan.');
    }

    public function update(StoreProductTypeRequest $request, string $id): RedirectResponse
    {
        $type = ProductType::withoutGlobalScope('tenant')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        $type->update($request->validated());

        return redirect()->route('product-types.index')
            ->with('success', 'Tipe produk berhasil diperbarui.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $type = ProductType::withoutGlobalScope('tenant')
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        if ($type->products()->exists()) {
            return back()->with('error', 'Tipe tidak bisa dihapus karena masih digunakan oleh produk.');
        }

        $type->delete();

        return redirect()->route('product-types.index')
            ->with('success', 'Tipe produk berhasil dihapus.');
    }
}

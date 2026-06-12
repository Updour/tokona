<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\Products;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Requests\Products\BulkMarkupProductRequest;
use App\Services\Products\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ProductsImport;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $service
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('products/Index', $this->service->indexData($request));
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            $tenant = \App\Models\Tenants::find(auth()->user()->tenant_id);
            $subService = new \App\Services\SubscriptionService();
            if ($tenant && !$subService->canAddProduct($tenant)) {
                return redirect()->back()->with('error', 'Limit jumlah produk tercapai! Silakan upgrade paket langganan Anda untuk menambah produk baru.');
            }
        }

        $product = $this->service->create($request->validated());

        return redirect()->route('products.index')
            ->with('success', "Produk \"{$product->name}\" berhasil ditambahkan.");
    }

    public function update(UpdateProductRequest $request, Products $product): RedirectResponse
    {
        $this->service->update($product, $request->validated());

        return redirect()->route('products.index')
            ->with('success', "Produk \"{$product->name}\" berhasil diperbarui.");
    }

    public function destroy(Products $product): RedirectResponse
    {
        $productClone = clone $product; // Clone before deletion to log properties if needed
        $name = $this->service->delete($product);

        \App\Services\ActivityLogger::log('Hapus Data Penting', "Menghapus produk: {$name}", $productClone, ['product_name' => $name, 'base_cost' => $productClone->base_cost]);

        return redirect()->route('products.index')
            ->with('success', "Produk \"{$name}\" berhasil dinonaktifkan.");
    }

    public function restore(string $id): RedirectResponse
    {
        $name = $this->service->restore($id);
        $product = Products::withTrashed()->find($id);

        \App\Services\ActivityLogger::log('Restore Data', "Memulihkan produk: {$name}", $product, ['product_name' => $name]);

        return redirect()->back()
            ->with('success', "Produk \"{$name}\" berhasil dipulihkan.");
    }

    public function pricing(Request $request): Response
    {
        return Inertia::render('products/Pricing', $this->service->indexData($request));
    }

    public function bulkMarkup(BulkMarkupProductRequest $request): RedirectResponse
    {
        $count = $this->service->bulkMarkup($request->validated());

        return redirect()->back()
            ->with('success', "Harga jual untuk {$count} produk berhasil dinaikkan!");
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120', // Maks 5MB
        ]);

        $tenantId = auth()->user()->isSuperAdmin() ? auth()->user()->tenant_id ?? 'guest' : auth()->user()->tenant_id;

        Excel::import(new ProductsImport($tenantId), $request->file('file'));

        return back()->with('success', 'Berhasil mengimpor data produk massal.');
    }
}

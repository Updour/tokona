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
        $name = $this->service->delete($product);

        return redirect()->route('products.index')
            ->with('success', "Produk \"{$name}\" berhasil dihapus.");
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
}

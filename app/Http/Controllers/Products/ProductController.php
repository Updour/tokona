<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\BulkMarkupProductRequest;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Imports\ProductsImport;
use App\Imports\ProductsImportPreview;
use App\Models\Branch;
use App\Models\Products;
use App\Models\Tenants;
use App\Services\ActivityLogger;
use App\Services\Products\ProductService;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

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
        if (! auth()->user()->isSuperAdmin()) {
            $tenant = Tenants::find(auth()->user()->tenant_id);
            $subService = new SubscriptionService;
            if ($tenant && ! $subService->canAddProduct($tenant)) {
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

        ActivityLogger::log('Hapus Data Penting', "Menghapus produk: {$name}", $productClone, ['product_name' => $name, 'base_cost' => $productClone->base_cost]);

        return redirect()->route('products.index')
            ->with('success', "Produk \"{$name}\" berhasil dinonaktifkan.");
    }

    public function restore(string $id): RedirectResponse
    {
        $name = $this->service->restore($id);
        $product = Products::withTrashed()->find($id);

        ActivityLogger::log('Restore Data', "Memulihkan produk: {$name}", $product, ['product_name' => $name]);

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

    public function importPreview(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        $user = auth()->user();
        $tenantId = $user->tenant_id ?? Tenants::first()->id;

        $preview = new ProductsImportPreview($tenantId);
        Excel::import($preview, $request->file('file'));

        // Ambil data existing untuk pilihan dropdown
        $existingCategories = \App\Models\ProductCategory::where('tenant_id', $tenantId)->get(['id', 'name']);
        $existingTypes = \App\Models\ProductType::where('tenant_id', $tenantId)->get(['id', 'name']);

        return response()->json([
            'new_categories' => array_values($preview->newCategories),
            'new_types' => array_values($preview->newTypes),
            'category_examples' => $preview->categoryExamples,
            'type_examples' => $preview->typeExamples,
            'existing_categories' => $existingCategories,
            'existing_types' => $existingTypes,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
            'category_mapping' => 'nullable|json',
            'type_mapping' => 'nullable|json',
        ]);

        $user = auth()->user();

        // Dapatkan Tenant & Branch
        $tenantId = $user->tenant_id ?? Tenants::first()->id;
        $branchId = $user->branch_id ?? Branch::where('tenant_id', $tenantId)->first()->id;

        $categoryMapping = $request->filled('category_mapping') ? json_decode($request->category_mapping, true) : [];
        $typeMapping = $request->filled('type_mapping') ? json_decode($request->type_mapping, true) : [];

        Excel::import(new ProductsImport($tenantId, $branchId, $categoryMapping, $typeMapping), $request->file('file'));

        return back()->with('success', 'Berhasil mengimpor data produk massal.');
    }
}

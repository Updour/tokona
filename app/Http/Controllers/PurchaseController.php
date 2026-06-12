<?php

namespace App\Http\Controllers;

use App\Queries\PurchaseQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\PurchaseService;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Http\Requests\Purchases\UpdatePurchaseStatusRequest;

class PurchaseController extends Controller
{
    protected PurchaseService $purchaseService;

    public function __construct(PurchaseService $purchaseService)
    {
        $this->purchaseService = $purchaseService;
    }
    public function index(Request $request): Response
    {
        return Inertia::render('purchases/index', (new PurchaseQuery($request))->indexData());
    }

    public function create(): Response
    {
        // Global scopes otomatis handle filter tenant
        $branches = \App\Models\Branch::select('id', 'name')->orderBy('name')->get();
        
        // Ambil produk yang aktif
        $products = \App\Models\Products::active()
            ->select('id', 'name', 'sku', 'barcode', 'base_cost', 'track_stock')
            ->orderBy('name')
            ->get();

        // Ambil data supplier
        $suppliers = \App\Models\Supplier::active()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('purchases/create', [
            'branches'  => $branches,
            'products'  => $products,
            'suppliers' => $suppliers,
        ]);
    }

    public function show(\App\Models\Purchase $purchase)
    {
        $purchase->load([
            'branch:id,name,address,phone',
            'supplier:id,name,phone,address',
            'items.product:id,name,sku'
        ]);

        return Inertia::render('purchases/show', [
            'purchase' => $purchase,
        ]);
    }

    public function updateStatus(UpdatePurchaseStatusRequest $request, \App\Models\Purchase $purchase)
    {
        try {
            $this->purchaseService->updateStatus($purchase, $request->validated('status'));
            return back()->with('success', "Status PO berhasil diubah menjadi {$request->validated('status')}!");
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengubah status: ' . $e->getMessage());
        }
    }

    public function store(StorePurchaseRequest $request)
    {
        try {
            $this->purchaseService->storePurchase($request->validated());
            return redirect()->route('purchases.index')->with('success', 'Transaksi pembelian berhasil disimpan!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }
}

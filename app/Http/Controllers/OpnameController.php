<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOpnameRequest;
use App\Models\Products;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpnameController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Menampilkan halaman daftar riwayat Stock Opname
     */
    public function index(Request $request)
    {
        $opnames = $this->inventoryService->getOpnameHistory($request->all());
        
        // Fetch products for the new opname dialog
        $productsQuery = Products::withCurrentStock()->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $productsQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $products = $productsQuery->get();

        return Inertia::render('inventory/opname/Index', [
            'opnames' => $opnames,
            'products' => $products,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Menyimpan hasil stock opname baru dan menyesuaikan stok
     */
    public function store(StoreOpnameRequest $request)
    {
        try {
            $this->inventoryService->recordOpname($request->validated());
            return redirect()->back()->with('success', 'Stock Opname berhasil dicatat dan stok telah disesuaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}

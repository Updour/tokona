<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Queries\SupplierQuery;
use App\Services\Suppliers\SupplierService;
use App\Http\Requests\Suppliers\StoreSupplierRequest;
use App\Http\Requests\Suppliers\UpdateSupplierRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SupplierController extends Controller
{
    protected SupplierService $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    public function index(Request $request): Response
    {
        return Inertia::render('suppliers/index', (new SupplierQuery($request))->indexData());
    }

    public function show(Supplier $supplier): Response
    {
        $data = $this->supplierService->getSupplierShowData($supplier);
        return Inertia::render('suppliers/show', $data);
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->supplierService->storeSupplier($request->validated());
        return redirect()->back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->supplierService->updateSupplier($supplier, $request->validated());
        return redirect()->back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier berhasil dihapus.');
    }
}

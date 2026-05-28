<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\RestockProductRequest;
use App\Models\Products;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;

class ProductRestockController extends Controller
{
    /**
     * Tambah stok manual (IN / ADJUST / RETURN).
     * Dipanggil dari dialog Restock di halaman produk.
     */
    public function store(RestockProductRequest $request, string $productId): RedirectResponse
    {
        $user    = auth()->user();
        $product = $user->isSuperAdmin()
            ? Products::withoutGlobalScope('tenant')->findOrFail($productId)
            : Products::withoutGlobalScope('tenant')
                ->where('tenant_id', $user->tenant_id)
                ->findOrFail($productId);

        StockMovement::create([
            'tenant_id'   => $product->tenant_id,
            'branch_id'   => $product->branch_id,
            'product_id'  => $product->id,
            'type'        => $request->validated('type'),   // IN | ADJUST | RETURN
            'qty'         => $request->validated('qty'),
            'unit_cost'   => $request->validated('unit_cost') ?? $product->base_cost,
            'source_type' => 'manual',
            'notes'       => $request->validated('notes'),
        ]);

        return back()->with('success', "Stok produk \"{$product->name}\" berhasil diperbarui.");
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PurchaseReturn;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseReturn::with(['branch:id,name', 'supplier:id,name'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('return_number', 'like', "%{$search}%");
        }

        $returns = $query->paginate(15)->withQueryString();

        return Inertia::render('purchase-returns/index', [
            'returns' => $returns,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        $branches = \App\Models\Branch::select('id', 'name')->orderBy('name')->get();
        $suppliers = \App\Models\Supplier::active()->select('id', 'name')->orderBy('name')->get();
        $products = \App\Models\Products::active()->select('id', 'name', 'sku', 'base_cost', 'track_stock')->orderBy('name')->get();

        return Inertia::render('purchase-returns/create', [
            'branches' => $branches,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|uuid',
            'supplier_id' => 'required|uuid',
            'return_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = collect($validated['items'])->sum(fn($i) => $i['qty'] * $i['unit_cost']);

            // Generate Return Number
            $branchCode = \App\Models\Branch::find($validated['branch_id'])->code ?? 'CAB';
            $returnNum = 'RET/' . $branchCode . '/' . date('Ymd') . '/' . rand(1000, 9999);

            $retur = PurchaseReturn::create([
                'tenant_id' => auth()->user()->tenant_id,
                'branch_id' => $validated['branch_id'],
                'supplier_id' => $validated['supplier_id'],
                'return_number' => $returnNum,
                'return_date' => $validated['return_date'],
                'total_amount' => $totalAmount,
                'status' => 'completed',
                'notes' => $validated['notes'],
            ]);

            foreach ($validated['items'] as $item) {
                $retur->items()->create([
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['qty'] * $item['unit_cost'],
                ]);

                // OTOMATIS TARIK STOK KELUAR (RETURN)
                $product = \App\Models\Products::find($item['product_id']);
                if ($product && $product->track_stock) {
                    $product->recordStockMovement('OUT', $item['qty'], [
                        'branch_id' => $validated['branch_id'],
                        'source_type' => 'purchase_return',
                        'notes' => 'Retur Barang ke Supplier: ' . $returnNum,
                        'unit_cost' => $item['unit_cost'],
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('purchase-returns.index')->with('success', 'Retur Pembelian berhasil disimpan dan stok otomatis dipotong!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan retur: ' . $e->getMessage());
        }
    }
}

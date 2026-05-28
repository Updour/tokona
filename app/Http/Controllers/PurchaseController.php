<?php

namespace App\Http\Controllers;

use App\Queries\PurchaseQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
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

    public function updateStatus(Request $request, \App\Models\Purchase $purchase)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,received,paid',
        ]);

        $oldStatus = $purchase->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return back();
        }

        $purchase->update(['status' => $newStatus]);

        // LOGIKA AKUNTANSI: Jika dari Draft -> Masuk Gudang (Received/Paid)
        if ($oldStatus === 'draft' && in_array($newStatus, ['received', 'paid'])) {
            foreach ($purchase->items as $item) {
                $product = \App\Models\Products::find($item->product_id);
                if ($product && $product->track_stock) {
                    $product->recordStockMovement('IN', $item->qty, [
                        'branch_id'   => $purchase->branch_id,
                        'source_type' => 'purchase',
                        'notes'       => 'Penerimaan PO: ' . ($purchase->invoice_number ?: 'Draft'),
                        'unit_cost'   => $item->unit_cost,
                    ]);
                }
            }
        }
        
        // LOGIKA AKUNTANSI: Jika di-Revert dari Masuk Gudang -> kembali ke Draft
        if (in_array($oldStatus, ['received', 'paid']) && $newStatus === 'draft') {
            foreach ($purchase->items as $item) {
                $product = \App\Models\Products::find($item->product_id);
                if ($product && $product->track_stock) {
                    $product->recordStockMovement('OUT', $item->qty, [
                        'branch_id'   => $purchase->branch_id,
                        'source_type' => 'purchase_revert',
                        'notes'       => 'Pembatalan PO ke Draft: ' . ($purchase->invoice_number ?: 'Draft'),
                        'unit_cost'   => $item->unit_cost,
                    ]);
                }
            }
        }

        return back()->with('success', "Status PO berhasil diubah menjadi {$newStatus}!");
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id'      => 'required|uuid',
            'invoice_number' => 'nullable|string',
            'purchase_date'  => 'required|date',
            'status'         => 'required|in:draft,received,paid',
            'global_discount'=> 'nullable|numeric|min:0',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.unit_cost'  => 'required|numeric|min:0',
            'items.*.discount'   => 'nullable|numeric|min:0',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $globalDiscount = $validated['global_discount'] ?? 0;
            $totalCost = collect($validated['items'])->sum(fn($i) => ($i['qty'] * $i['unit_cost']) - ($i['discount'] ?? 0)) - $globalDiscount;

            $purchase = \App\Models\Purchase::create([
                'tenant_id'      => auth()->user()->tenant_id,
                'branch_id'      => $validated['branch_id'],
                'supplier_id'    => $request->input('supplier_id'),
                'invoice_number' => $validated['invoice_number'],
                'purchase_date'  => $validated['purchase_date'],
                'status'         => $validated['status'],
                'global_discount'=> $globalDiscount,
                'total_cost'     => $totalCost,
            ]);

            foreach ($validated['items'] as $item) {
                $discount = $item['discount'] ?? 0;
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'unit_cost'  => $item['unit_cost'],
                    'discount'   => $discount,
                    'subtotal'   => ($item['qty'] * $item['unit_cost']) - $discount,
                ]);

                // ─── SINKRONISASI OTOMATIS: Tambah stok jika diterima/lunas ───
                if (in_array($purchase->status, ['received', 'paid'])) {
                    $product = \App\Models\Products::find($item['product_id']);
                    if ($product && $product->track_stock) {
                        $effectiveUnitCost = $item['qty'] > 0 ? (($item['qty'] * $item['unit_cost']) - $discount) / $item['qty'] : $item['unit_cost'];
                        $product->recordStockMovement('IN', $item['qty'], [
                            'branch_id'   => $validated['branch_id'],
                            'source_type' => 'purchase',
                            'notes'       => 'Penerimaan PO/Invoice: ' . ($purchase->invoice_number ?: 'Tanpa No. INV'),
                            'unit_cost'   => $effectiveUnitCost,
                        ]);
                    }
                }
            }

            \Illuminate\Support\Facades\DB::commit();
            return redirect()->route('purchases.index')->with('success', 'Transaksi pembelian berhasil disimpan!');
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }
}

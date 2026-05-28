<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\CheckoutPOSRequest;
use App\Services\PosService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    protected PosService $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    /**
     * Tampilan POS Kasir Utama
     */
    public function index(Request $request): Response
    {
        $data = $this->posService->getPosPageData($request->all());
        return Inertia::render('products/pos', $data);
    }

    /**
     * Checkout POS Transaksi Penjualan
     */
    public function checkout(CheckoutPOSRequest $request): RedirectResponse
    {
        $transaction = $this->posService->processCheckout($request->validated());

        return redirect()->back()->with('success', "Transaksi penjualan berhasil disimpan! Nomor Invoice: {$transaction->invoice_number}");
    }

    /**
     * Retur Transaksi Penjualan POS
     */
    public function return(Request $request): RedirectResponse
    {
        $request->validate([
            'transaction_id' => 'required|uuid|exists:transactions,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        $this->posService->processReturn($request->all());

        return redirect()->back()->with('success', 'Transaksi penjualan berhasil diretur dan stok barang telah dikembalikan!');
    }

    /**
     * Simpan Pengaturan POS Kasir Terminal ke Database Cabang
     */
    public function saveSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'taxEnabled' => 'required|boolean',
            'taxRate' => 'required|integer|min:0|max:100',
            'activeMethods' => 'required|array',
            'activeMethods.cash' => 'required|boolean',
            'activeMethods.transfer' => 'required|boolean',
            'activeMethods.debt' => 'required|boolean',
            'roundingNearest' => 'nullable|integer|in:1,100,500,1000',
            'roundingMethod' => 'nullable|string|in:round,floor,ceil',
        ]);

        $this->posService->savePosSettings($request->all());

        return redirect()->back()->with('success', 'Pengaturan kasir berhasil disimpan ke database!');
    }
}

<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\CheckoutPOSRequest;
use App\Http\Requests\Products\PayDebtRequest;
use App\Http\Requests\Products\ReturnPOSRequest;
use App\Http\Requests\Products\SavePOSSettingsRequest;
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
    public function return(ReturnPOSRequest $request): RedirectResponse
    {
        $this->posService->processReturn($request->validated());

        return redirect()->back()->with('success', 'Transaksi penjualan berhasil diretur dan stok barang telah dikembalikan!');
    }

    /**
     * Pelunasan Piutang Transaksi
     */
    public function payDebt(PayDebtRequest $request, string $id): RedirectResponse
    {
        $this->posService->processPayDebt($id, $request->validated());

        return redirect()->back()->with('success', 'Pelunasan piutang berhasil dicatat!');
    }

    /**
     * Simpan Pengaturan POS Kasir Terminal ke Database Cabang
     */
    public function saveSettings(SavePOSSettingsRequest $request): RedirectResponse
    {
        $this->posService->savePosSettings($request->validated());

        return redirect()->back()->with('success', 'Pengaturan kasir berhasil disimpan ke database!');
    }
}

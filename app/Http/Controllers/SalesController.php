<?php

namespace App\Http\Controllers;

use App\Services\SalesService;
use App\Http\Requests\Sales\LoadStockRequest;
use App\Http\Requests\Sales\RecordOrderRequest;
use App\Http\Requests\Sales\StoreSalesRequest;
use App\Http\Requests\Sales\UnloadStockRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesController extends Controller
{
    protected $salesService;

    public function __construct(SalesService $salesService)
    {
        $this->salesService = $salesService;
    }

    /**
     * Tampilan daftar sales lapangan.
     */
    public function index(Request $request)
    {
        $data = $this->salesService->getSalesListData($request->all());

        return Inertia::render('sales/Index', $data);
    }

    /**
     * Menyimpan data sales representative baru.
     */
    public function store(StoreSalesRequest $request)
    {
        try {
            $this->salesService->storeSalesPerson($request->validated());

            return redirect()->back()->with('success', 'Berhasil menambahkan personel sales representative baru.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Tampilan log kunjungan lapangan sales.
     */
    public function visits(Request $request)
    {
        $data = $this->salesService->getVisitsListData($request->all());

        return Inertia::render('sales/Visits', $data);
    }

    /**
     * Tampilan peta sebaran outlet GPS.
     */
    public function map(Request $request)
    {
        $data = $this->salesService->getMapData($request->all());

        return Inertia::render('sales/Map', $data);
    }

    public function loadStock(LoadStockRequest $request)
    {
        try {
            $this->salesService->loadStockToSales(
                $request->sales_person_id,
                $request->product_id,
                $request->qty
            );

            return redirect()->back()->with('success', 'Berhasil memuat barang ke kendaraan sales canvas.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Menarik kembali sisa stok dari kendaraan sales ke gudang cabang utama (Unloading Canvas).
     */
    public function unloadStock(UnloadStockRequest $request)
    {
        try {
            $totalUnloaded = $this->salesService->unloadStockFromSales($request->sales_person_id);

            return redirect()->back()->with('success', "Berhasil menarik {$totalUnloaded} sisa barang muatan sales kembali ke gudang.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Catat penjualan order ke toko/warung lain dari stok canvas.
     */
    public function recordOrder(RecordOrderRequest $request)
    {
        try {
            $this->salesService->recordSalesOrder(
                $request->sales_visit_id,
                $request->items,
                $request->payment_method
            );

            return redirect()->back()->with('success', 'Order penjualan canvas berhasil disetorkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Memperbarui data sales representative.
     */
    public function update(StoreSalesRequest $request, $id)
    {
        try {
            $this->salesService->updateSalesPerson($id, $request->validated());

            return redirect()->back()->with('success', 'Berhasil memperbarui data sales representative.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Menghapus sales representative secara aman.
     */
    public function destroy($id)
    {
        try {
            $this->salesService->deleteSalesPerson($id);

            return redirect()->back()->with('success', 'Berhasil menghapus personel sales representative.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\CanvasCheckInRequest;
use App\Http\Requests\CanvasCheckoutRequest;
use App\Models\Customer;
use App\Models\SalesPerson;
use App\Models\SalesVisit;
use App\Services\SalesService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CanvasSalesController extends Controller
{
    protected SalesService $salesService;

    public function __construct(SalesService $salesService)
    {
        $this->salesService = $salesService;
    }

    /**
     * Dapatkan instance SalesPerson milik user yang sedang login.
     * Menggunakan pencocokan email sebagai identifier utama.
     */
    protected function getActiveSalesPerson()
    {
        $user = auth()->user();
        if (!$user) return null;

        $sales = SalesPerson::where('email', $user->email)->first();

        // Jika user adalah super admin tapi tidak punya profil sales, beri akses mock untuk preview
        if (!$sales && $user->isSuperAdmin()) {
            $sales = new SalesPerson([
                'tenant_id' => $user->tenant_id ?? \App\Models\Tenants::first()->id ?? \Illuminate\Support\Str::uuid(),
                'branch_id' => $user->branch_id ?? \App\Models\Branch::first()->id ?? \Illuminate\Support\Str::uuid(),
                'name' => $user->name . ' (Admin Preview)',
                'email' => $user->email,
                'phone' => $user->phone ?? '-',
                'is_active' => true,
            ]);
            $sales->id = $user->id;
        }

        return $sales;
    }

    /**
     * Menampilkan Halaman Utama Canvas Mobile (Daftar Customer & Check-In)
     */
    public function index(Request $request): Response
    {
        $sales = $this->getActiveSalesPerson();

        if (!$sales) {
            // Jika user login tapi tidak punya profil sales, beri tampilan error/kosong
            return Inertia::render('canvas/Error', [
                'message' => 'Profil Sales Lapangan tidak ditemukan untuk akun ini. Pastikan email Anda terdaftar di data Sales Representative.'
            ]);
        }

        $customers = Customer::orderBy('name')->get();

        // Kunjungan hari ini oleh sales ini
        $todayVisits = SalesVisit::with('customer')
            ->where('sales_id', $sales->id)
            ->whereDate('visited_at', today())
            ->orderByDesc('visited_at')
            ->get();

        return Inertia::render('canvas/Index', [
            'sales' => $sales,
            'customers' => $customers,
            'todayVisits' => $todayVisits,
        ]);
    }

    /**
     * Menampilkan Mini POS Canvas untuk memproses pesanan
     */
    public function pos(Request $request): Response
    {
        $sales = $this->getActiveSalesPerson();
        if (!$sales) {
            return Inertia::render('canvas/Error', ['message' => 'Unauthorized']);
        }

        $visitId = $request->query('visit_id');
        $visit = SalesVisit::with('customer')->where('id', $visitId)->where('sales_id', $sales->id)->firstOrFail();

        // Ambil stok yang sedang dibawa oleh sales (SalesLoadedStock)
        $loadedStocks = \App\Models\SalesLoadedStock::with('product')
            ->where('sales_person_id', $sales->id)
            ->where('current_stock', '>', 0)
            ->get()
            ->map(function ($stock) {
                return [
                    'product_id' => $stock->product_id,
                    'name' => $stock->product->name,
                    'sku' => $stock->product->sku,
                    'price' => $stock->product->sell_price,
                    'current_stock' => $stock->current_stock,
                    'image' => $stock->product->image_path,
                ];
            });

        return Inertia::render('canvas/Pos', [
            'sales' => $sales,
            'visit' => $visit,
            'loadedStocks' => $loadedStocks,
        ]);
    }

    /**
     * Memproses perekaman Check-In kunjungan dari GPS HP
     */
    public function checkIn(CanvasCheckInRequest $request)
    {
        $sales = $this->getActiveSalesPerson();
        if (!$sales) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $data = $request->validated();
        
        $visit = $this->salesService->recordSalesVisit($sales->id, [
            ...$data,
            'status' => 'visit',
            'visited_at' => now(),
            'branch_id' => $sales->branch_id,
        ]);

        return redirect()->back()->with('success', 'Check-in kunjungan berhasil direkam.');
    }

    /**
     * Memproses pesanan Canvas (Checkout) dari HP memotong stok muatan sales
     */
    public function checkout(CanvasCheckoutRequest $request)
    {
        $sales = $this->getActiveSalesPerson();
        if (!$sales) {
            return redirect()->route('canvas.index')->with('error', 'Unauthorized');
        }

        $data = $request->validated();

        try {
            $order = $this->salesService->recordSalesOrder(
                $data['sales_visit_id'],
                $data['items'],
                $data['payment_method']
            );

            return redirect()->route('canvas.index')->with('success', 'Pesanan canvas berhasil disimpan!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}

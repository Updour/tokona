<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Promos\StorePromoRequest;
use App\Http\Requests\Promos\UpdatePromoRequest;
use App\Services\Promos\PromoService;

class PromoController extends Controller
{
    public function __construct(private readonly PromoService $promoService) {}

    public function index(Request $request)
    {
        return Inertia::render('promos/index', $this->promoService->indexData($request));
    }

    public function store(StorePromoRequest $request)
    {
        $this->promoService->create($request->validated());
        return back()->with('success', 'Aturan Promo berhasil dibuat!');
    }

    public function update(UpdatePromoRequest $request, Promo $promo)
    {
        $this->promoService->update($promo, $request->validated());
        return back()->with('success', 'Aturan Promo berhasil diperbarui!');
    }

    public function destroy(Promo $promo)
    {
        $this->promoService->delete($promo);
        return back()->with('success', 'Promo berhasil dihapus!');
    }

    public function vouchers(Request $request)
    {
        $data = $this->promoService->getVouchersPageData($request->all());
        return Inertia::render('promos/vouchers', $data);
    }
}

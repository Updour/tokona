<?php

namespace App\Services\Promos;

use App\Models\Promo;
use App\Queries\PromoQuery;
use Illuminate\Http\Request;

class PromoService
{
    public function indexData(Request $request): array
    {
        $query = new PromoQuery($request);
        return $query->indexData();
    }

    public function create(array $data): Promo
    {
        $data['tenant_id'] = $data['tenant_id'] ?? auth()->user()->tenant_id;
        return Promo::create($data);
    }

    public function update(Promo $promo, array $data): Promo
    {
        $promo->update($data);
        return $promo;
    }

    public function delete(Promo $promo): void
    {
        $promo->delete();
    }

    /** Mendapatkan data lengkap dan statistik untuk halaman voucher/marketing */
    public function getVouchersPageData(array $filters): array
    {
        // Hitung statistik voucher (menggunakan model Promo yang sudah di-scope secara otomatis)
        $stats = [
            'total' => Promo::count(),
            'active' => Promo::where('is_active', true)->count(),
            'inactive' => Promo::where('is_active', false)->count(),
        ];

        // Fetch data vouchers tersaring dengan paginasi
        $vouchers = Promo::filterVouchers($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();

        return [
            'vouchers' => $vouchers,
            'stats' => $stats,
            'filters' => array_intersect_key($filters, array_flip(['search', 'status'])),
        ];
    }
}

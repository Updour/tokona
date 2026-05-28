<?php

namespace App\Services\Customers;

use App\Models\Customer;
use App\Queries\CustomerQuery;
use Illuminate\Http\Request;

class CustomerService
{
    public function indexData(Request $request): array
    {
        $query = new CustomerQuery($request);
        return $query->indexData();
    }

    public function create(array $data): Customer
    {
        $data['tenant_id'] = $data['tenant_id'] ?? auth()->user()->tenant_id;
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);
        return $customer;
    }

    public function delete(Customer $customer): void
    {
        $customer->delete();
    }

    /** Mendapatkan data lengkap dan statistik untuk halaman membership pelanggan */
    public function getMembershipPageData(array $filters): array
    {
        // Hitung statistik keanggotaan (menggunakan model Customer yang sudah di-scope secara otomatis)
        $stats = [
            'total' => Customer::count(),
            'regular' => Customer::where('tier', 'regular')->count(),
            'member' => Customer::where('tier', 'member')->count(),
            'wholesale' => Customer::where('tier', 'wholesale')->count(),
            'distributor' => Customer::where('tier', 'distributor')->count(),
            'points' => Customer::sum('points'),
        ];

        // Fetch data members tersaring dengan paginasi
        $members = Customer::filterMembership($filters)
            ->orderBy('points', 'desc')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();

        return [
            'members' => $members,
            'stats' => $stats,
            'filters' => array_intersect_key($filters, array_flip(['search', 'tier'])),
        ];
    }
}

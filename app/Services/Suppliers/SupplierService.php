<?php

namespace App\Services\Suppliers;

use App\Models\Supplier;

class SupplierService
{
    /**
     * Get detailed stats and purchase history for a supplier
     */
    public function getSupplierShowData(Supplier $supplier): array
    {
        $supplier->load(['purchases' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }, 'purchases.branch:id,name']);

        // Calculate stats
        $totalBelanja = $supplier->purchases->whereIn('status', ['received', 'paid'])->sum('total_cost');
        $totalHutang = $supplier->purchases->where('status', 'received')->sum('total_cost');

        return [
            'supplier' => $supplier,
            'stats' => [
                'total_belanja' => $totalBelanja,
                'total_hutang'  => $totalHutang,
                'total_po'      => $supplier->purchases->count(),
            ]
        ];
    }

    /**
     * Store new supplier entry
     */
    public function storeSupplier(array $data): Supplier
    {
        $data['tenant_id'] = $data['tenant_id'] ?? auth()->user()->tenant_id;
        return Supplier::create($data);
    }

    /**
     * Update existing supplier entry
     */
    public function updateSupplier(Supplier $supplier, array $data): bool
    {
        return $supplier->update($data);
    }
}

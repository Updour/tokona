<?php

namespace App\Services;

use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class BranchService
{
    /**
     * Store new branch in database
     */
    public function storeBranch(array $data): Branch
    {
        return DB::transaction(function () use ($data) {
            // Force tenant_id if not super admin
            if (!auth()->user()->isSuperAdmin()) {
                $data['tenant_id'] = auth()->user()->tenant_id;
            }

            // Handle main branch exclusivity
            if (!empty($data['is_main'])) {
                Branch::where('tenant_id', $data['tenant_id'])
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }

            return Branch::create([
                'tenant_id' => $data['tenant_id'],
                'name' => $data['name'],
                'code' => strtoupper($data['code']),
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'is_main' => $data['is_main'] ?? false,
                'pos_settings' => $data['pos_settings'] ?? null,
            ]);
        });
    }

    /**
     * Update existing branch in database
     */
    public function updateBranch(Branch $branch, array $data): Branch
    {
        return DB::transaction(function () use ($branch, $data) {
            if (!auth()->user()->isSuperAdmin()) {
                $data['tenant_id'] = auth()->user()->tenant_id;
            }

            // Handle main branch exclusivity
            if (!empty($data['is_main'])) {
                Branch::where('tenant_id', $data['tenant_id'])
                    ->where('id', '!=', $branch->id)
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }

            $branch->update([
                'name' => $data['name'],
                'code' => strtoupper($data['code']),
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'is_main' => $data['is_main'] ?? false,
                'pos_settings' => $data['pos_settings'] ?? null,
            ]);

            return $branch;
        });
    }
}

<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Products;
use App\Models\Tenants;
use App\Models\User; // or TenantLocations

class SubscriptionService
{
    public const PLAN_LIMITS = [
        'free' => [
            'branches' => 1,
            'products' => 50,
            'users' => 3,
        ],
        'pro' => [
            'branches' => 5,
            'products' => 1000,
            'users' => 15,
        ],
        'enterprise' => [
            'branches' => 999999,
            'products' => 999999,
            'users' => 999999,
        ],
    ];

    /**
     * Get active plan limits for a tenant.
     */
    public function getLimits(string $planSlug): array
    {
        $limits = \Illuminate\Support\Facades\Cache::rememberForever('plan_limits_' . $planSlug, function () use ($planSlug) {
            $plan = \App\Models\Plan::where('slug', $planSlug)->first();
            if ($plan) {
                return [
                    'branches' => $plan->max_branches,
                    'products' => $plan->max_products,
                    'users' => $plan->max_users,
                ];
            }
            return null;
        });

        if ($limits) {
            return $limits;
        }

        // Fallback if not found in db
        return self::PLAN_LIMITS[$planSlug] ?? self::PLAN_LIMITS['free'];
    }

    /**
     * Check if a tenant can add another branch.
     */
    public function canAddBranch(Tenants $tenant): bool
    {
        $limits = $this->getLimits($tenant->plan);
        $currentCount = Branch::where('tenant_id', $tenant->id)->count();

        return $currentCount < $limits['branches'];
    }

    /**
     * Check if a tenant can add another product.
     */
    public function canAddProduct(Tenants $tenant): bool
    {
        $limits = $this->getLimits($tenant->plan);

        // Count products for this tenant
        $currentCount = Products::where('tenant_id', $tenant->id)->count();

        return $currentCount < $limits['products'];
    }

    /**
     * Check if a tenant can add another employee user.
     */
    public function canAddUser(Tenants $tenant): bool
    {
        $limits = $this->getLimits($tenant->plan);

        // Count users for this tenant
        $currentCount = User::where('tenant_id', $tenant->id)->count();

        return $currentCount < $limits['users'];
    }
}

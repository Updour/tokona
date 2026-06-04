<?php

namespace App\Services;

use App\Models\Tenants;
use App\Models\Product;
use App\Models\User;
use App\Models\Branch; // or TenantLocations

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
    public function getLimits(string $plan): array
    {
        return self::PLAN_LIMITS[$plan] ?? self::PLAN_LIMITS['free'];
    }

    /**
     * Check if a tenant can add another branch.
     */
    public function canAddBranch(Tenants $tenant): bool
    {
        $limits = $this->getLimits($tenant->plan);
        $currentCount = $tenant->location()->count(); // Using location relation or locations
        return $currentCount < $limits['branches'];
    }

    /**
     * Check if a tenant can add another product.
     */
    public function canAddProduct(Tenants $tenant): bool
    {
        $limits = $this->getLimits($tenant->plan);
        
        // Count products for this tenant
        $currentCount = Product::where('tenant_id', $tenant->id)->count();
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

<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Products;
use App\Models\Tenants;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    /**
     * Display the Billing & Revenue dashboard.
     */
    public function billing(): Response
    {
        // Enforce Super Admin only
        if (! auth()->user()->isSuperAdmin()) {
            abort(403, 'Akses khusus Pemilik Aplikasi Utama.');
        }

        $freeCount = Tenants::withoutGlobalScopes()->where('plan', 'free')->count();
        $proCount = Tenants::withoutGlobalScopes()->where('plan', 'pro')->count();
        $enterpriseCount = Tenants::withoutGlobalScopes()->where('plan', 'enterprise')->count();

        // Calculate Monthly Recurring Revenue (MRR)
        $mrr = ($proCount * 199000) + ($enterpriseCount * 499000);

        $recentTransactions = Tenants::withoutGlobalScopes()
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get(['name', 'plan', 'status', 'expires_at', 'updated_at']);

        return Inertia::render('superadmin/Billing', [
            'stats' => [
                'free_stores' => $freeCount,
                'pro_stores' => $proCount,
                'enterprise_stores' => $enterpriseCount,
                'total_stores' => $freeCount + $proCount + $enterpriseCount,
                'mrr' => $mrr,
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Display the Platform Store Monitoring dashboard.
     */
    public function monitoring(): Response
    {
        // Enforce Super Admin only
        if (! auth()->user()->isSuperAdmin()) {
            abort(403, 'Akses khusus Pemilik Aplikasi Utama.');
        }

        $totalStores = Tenants::withoutGlobalScopes()->count();
        $totalBranches = Branch::withoutGlobalScopes()->count();
        $totalUsers = User::withoutGlobalScopes()->count();

        // Count products safely
        $totalProducts = Products::withoutGlobalScopes()->count();

        $activeStores = Tenants::withoutGlobalScopes()
            ->with(['location'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('superadmin/Monitoring', [
            'stats' => [
                'stores' => $totalStores,
                'branches' => $totalBranches,
                'products' => $totalProducts,
                'users' => $totalUsers,
            ],
            'activeStores' => $activeStores,
        ]);
    }

    /**
     * Display the SaaS Plans & Features limitations.
     */
    public function plans(): Response
    {
        // Enforce Super Admin only
        if (! auth()->user()->isSuperAdmin()) {
            abort(403, 'Akses khusus Pemilik Aplikasi Utama.');
        }

        $plans = \App\Models\Plan::orderBy('price', 'asc')->get();

        return Inertia::render('superadmin/Plans', [
            'plans' => $plans
        ]);
    }

    /**
     * Update a specific SaaS plan.
     */
    public function updatePlan(\Illuminate\Http\Request $request, $id)
    {
        if (! auth()->user()->isSuperAdmin()) {
            abort(403, 'Akses khusus Pemilik Aplikasi Utama.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'max_branches' => 'required|integer|min:1',
            'max_users' => 'required|integer|min:1',
            'max_products' => 'required|integer|min:1',
        ]);

        $plan = \App\Models\Plan::findOrFail($id);
        $plan->update($validated);

        return back()->with('success', 'Paket langganan berhasil diperbarui.');
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Tenants;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // Hitung is_super_admin sekali saja
        $isSuperAdmin = $user?->isSuperAdmin() ?? false;

        // Super admin dapat daftar semua tenant untuk dipilih
        // User biasa hanya dapat data tenant miliknya
        $tenants = null;
        $branches = null;

        if ($user) {
            if ($isSuperAdmin) {
                $tenants = Tenants::select('id', 'name', 'slug', 'status')
                    ->orderBy('name')
                    ->get();

                $branches = Branch::select('id', 'tenant_id', 'name', 'code', 'is_main')
                    ->orderBy('name')
                    ->get();
            } else {
                $tenants = Tenants::where('id', $user->tenant_id)
                    ->select('id', 'name', 'slug', 'status')
                    ->get();

                $branches = Branch::where('tenant_id', $user->tenant_id)
                    ->select('id', 'tenant_id', 'name', 'code', 'is_main')
                    ->orderBy('name')
                    ->get();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'role'           => $user->load('role')->role?->name ?? 'cashier',
                    'is_super_admin' => $isSuperAdmin,
                ]) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            // Tersedia global di semua halaman
            'tenants'  => $tenants,
            'branches' => $branches,
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Menu;
use App\Models\Products;
use App\Models\Tenants;
use App\Models\User;
use App\Services\Products\ProductService;
use App\Services\SubscriptionService;
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

        $permissions = [];
        $menus = [];

        if ($user) {
            if ($isSuperAdmin) {
                $tenants = Tenants::select('id', 'name', 'slug', 'status', 'logo_url')
                    ->orderBy('name')
                    ->get();

                $branches = Branch::select('id', 'tenant_id', 'name', 'code', 'is_main')
                    ->orderBy('name')
                    ->get();
            } else {
                $tenants = Tenants::where('id', $user->tenant_id)
                    ->select('id', 'name', 'slug', 'status', 'logo_url')
                    ->get();

                $branches = Branch::where('tenant_id', $user->tenant_id)
                    ->select('id', 'tenant_id', 'name', 'code', 'is_main')
                    ->orderBy('name')
                    ->get();
            }

            // Load user permissions
            $permissions = $user->roles()
                ->with('permissions')
                ->get()
                ->pluck('permissions')
                ->flatten()
                ->pluck('key')
                ->unique()
                ->values()
                ->toArray();

            // Ambil pengaturan modul cabang
            $currentBranch = Branch::find($user->branch_id);
            $posSettings = $currentBranch ? $currentBranch->pos_settings : [];
            $requireShift = $posSettings['require_shift'] ?? true;
            $enableCanvas = $posSettings['enable_canvas'] ?? false;
            $enableConsignment = $posSettings['enable_consignment'] ?? false;
            $enableAttendance = $posSettings['enable_attendance'] ?? false;

            // Load parent menus from DB with their children to avoid N+1 query
            $dbMenus = Menu::with('children')
                ->whereNull('parent_id')
                ->orderBy('order', 'asc')
                ->get();

            foreach ($dbMenus as $menu) {
                if ($menu->permission_key && ! $isSuperAdmin && ! in_array($menu->permission_key, $permissions)) {
                    continue;
                }

                // Filter berdasarkan pos_settings (Modul Opsional) - SuperAdmin bypass ini
                if (! $isSuperAdmin) {
                    if (! $requireShift && $menu->title === 'Shift Kasir') {
                        continue;
                    }
                    if (! $enableCanvas && $menu->title === 'Aplikasi Canvas') {
                        continue;
                    }
                    if (! $enableConsignment && $menu->title === 'Barang Titipan') {
                        continue;
                    }
                    if (! $enableAttendance && $menu->title === 'Absensi Pegawai') {
                        continue;
                    }
                }

                // Filter submenus (children) already eager loaded
                $children = $menu->children;

                $filteredChildren = [];
                foreach ($children as $child) {
                    if ($child->permission_key && ! $isSuperAdmin && ! in_array($child->permission_key, $permissions)) {
                        continue;
                    }

                    // Filter berdasarkan pos_settings (Modul Opsional) - SuperAdmin bypass ini
                    if (! $isSuperAdmin) {
                        if (! $requireShift && $child->title === 'Shift Kasir') {
                            continue;
                        }
                        if (! $enableCanvas && $child->title === 'Aplikasi Canvas') {
                            continue;
                        }
                        if (! $enableConsignment && $child->title === 'Barang Titipan') {
                            continue;
                        }
                        if (! $enableAttendance && $child->title === 'Absensi Pegawai') {
                            continue;
                        }
                    } else {
                        // Khusus Super Admin: Sembunyikan menu Role & permission agar khusus untuk Owner saja
                        if ($child->title === 'Role & permission') {
                            continue;
                        }
                    }
                    $filteredChildren[] = [
                        'title' => $child->title,
                        'href' => $child->href,
                        'permission_key' => $child->permission_key,
                        'order' => $child->order,
                    ];
                }

                $menus[] = [
                    'title' => $menu->title,
                    'href' => $menu->href,
                    'icon' => $menu->icon,
                    'permission_key' => $menu->permission_key,
                    'order' => $menu->order,
                    'items' => $filteredChildren,
                ];
            }

            // Calculate active subscription limits and usage
            $activeTenant = Tenants::find($user->tenant_id);
            $subscription = null;
            if ($activeTenant) {
                $subService = new SubscriptionService;
                $limits = $subService->getLimits($activeTenant->plan ?? 'free');
                $subscription = [
                    'plan' => $activeTenant->plan ?? 'free',
                    'expires_at' => $activeTenant->expires_at ? $activeTenant->expires_at->toIso8601String() : null,
                    'limits' => $limits,
                    'usage' => [
                        'branches' => Branch::where('tenant_id', $activeTenant->id)->count(),
                        'products' => Products::where('tenant_id', $activeTenant->id)->count(),
                        'users' => User::where('tenant_id', $activeTenant->id)->count(),
                    ],
                ];
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.current_tenant') ? config('app.current_tenant')->name : config('app.name'),
            'currentTenant' => config('app.current_tenant'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'role' => $user->load('role')->role?->name ?? 'cashier',
                    'is_super_admin' => $isSuperAdmin,
                    'permissions' => $permissions,
                ]) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Tersedia global di semua halaman
            'tenants' => $tenants,
            'branches' => $branches,
            'menus' => $menus,
            'subscription' => $subscription ?? null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'low_stock_count' => $user ? fn () => app(ProductService::class)->getLowStockCount() : 0,
            'alerts' => fn () => app(\App\Services\NotificationService::class)->getUnreadAlerts(),
            'sys_health_degraded' => (function() {
                try {
                    return !\App\Services\SystemHealthService::check();
                } catch (\Exception $e) {
                    return false;
                }
            })(),
        ];
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenants;

class CheckTenantSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Lewati jika user belum login atau route-nya dikecualikan
        if (!auth()->check()) {
            return $next($request);
        }

        // 2. Kecualikan halaman expired, logout, dan asset agar tidak looping
        if ($request->is('subscription-expired') || $request->is('logout') || $request->is('_debugbar*')) {
            return $next($request);
        }

        $user = auth()->user();

        // 3. Super Admin selalu memiliki akses penuh tanpa batasan masa aktif
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // 4. Periksa tenant aktif milik user biasa
        if ($user->tenant_id) {
            $tenant = Tenants::withoutGlobalScopes()->find($user->tenant_id);
            
            if ($tenant) {
                // Jika status suspended ATAU masa aktif (expires_at) sudah lewat dari waktu saat ini
                $isExpired = $tenant->expires_at && now()->greaterThan($tenant->expires_at);
                $isSuspended = $tenant->status === 'suspended';

                if ($isExpired || $isSuspended) {
                    // Jika request meminta JSON / Inertia (frontend routing), kirim response redirect Inertia
                    if ($request->expectsJson() || $request->header('X-Inertia')) {
                        return response('', 409)->header('X-Inertia-Location', url('/subscription-expired'));
                    }
                    return redirect('/subscription-expired');
                }
            }
        }

        return $next($request);
    }
}

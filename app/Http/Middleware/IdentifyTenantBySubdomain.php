<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenants;

class IdentifyTenantBySubdomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $parts = explode('.', $host);

        // Jika hanya localhost atau tokona.com tanpa subdomain, biarkan lolos
        // Biasanya hitungan array part: 1 (localhost), 2 (tokona.com), >2 (toko-budi.tokona.com)
        if (count($parts) > 1 && $parts[0] !== 'www') {
            $subdomain = $parts[0];

            $tenant = Tenants::where('slug', $subdomain)->first();

            if ($tenant) {
                // Simpan data tenant di global config agar mudah dipanggil di mana saja
                config(['app.current_tenant' => $tenant]);

                // Enforce tenant isolation untuk user yang sudah login
                if (auth()->check()) {
                    // Beri izin jika user adalah Super Admin (is_super_admin)
                    if (auth()->user()->tenant_id !== $tenant->id && !auth()->user()->isSuperAdmin()) {
                        auth()->logout();
                        $request->session()->invalidate();
                        $request->session()->regenerateToken();
                        
                        // Redirect ke login dengan pesan error
                        return redirect()->route('login')->withErrors([
                            'email' => 'Akun Anda tidak terdaftar di toko ini.'
                        ]);
                    }
                }
            } else {
                // Jika subdomain tidak dikenali (bukan toko yang terdaftar)
                if ($host !== 'localhost' && $host !== '127.0.0.1') {
                    abort(404, 'Toko tidak ditemukan atau URL salah.');
                }
            }
        }

        return $next($request);
    }
}

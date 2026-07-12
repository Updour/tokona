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

        // Jika host adalah alamat IP, abaikan (bukan subdomain)
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $next($request);
        }

        $appUrl = config('app.url');
        $mainHost = parse_url($appUrl, PHP_URL_HOST) ?? 'localhost';

        $subdomain = null;

        // 1. Cek apakah host diakhiri dengan main host (misal: .tokona.com atau .localhost)
        if (str_ends_with($host, '.' . $mainHost)) {
            $subdomain = substr($host, 0, -strlen('.' . $mainHost));
        } else {
            // 2. Fallback: deteksi berdasarkan jumlah segmentasi domain
            $parts = explode('.', $host);
            if (count($parts) === 2 && in_array(end($parts), ['localhost', 'test'])) {
                // Di lokal development menggunakan format toko-budi.localhost atau toko-budi.test
                $subdomain = $parts[0];
            } elseif (count($parts) > 2) {
                // Di production atau env lain dengan format toko-budi.tokona.com
                $subdomain = $parts[0];
            }
        }

        // Jika ada subdomain dan bukan 'www', identifikasi sebagai tenant
        if ($subdomain && $subdomain !== 'www') {
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

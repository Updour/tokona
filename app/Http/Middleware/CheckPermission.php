<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!auth()->check() || !auth()->user()->hasPermission($permission)) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                abort(403, 'Anda tidak memiliki hak akses untuk tindakan ini.');
            }
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk melakukan tindakan tersebut.');
        }

        return $next($request);
    }
}

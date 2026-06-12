<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(
            append: [
                \App\Http\Middleware\CheckTenantSubscription::class,
                HandleAppearance::class,
                HandleInertiaRequests::class,
            ],
            remove: [
                \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            ]
        );

        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (\Throwable $e) {
            try {
                // Ignore common HTTP exceptions that are not critical system errors
                if ($e instanceof \Illuminate\Validation\ValidationException || 
                    $e instanceof \Illuminate\Auth\AuthenticationException ||
                    $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                    return;
                }

                \App\Models\SystemLog::create([
                    'tenant_id' => auth()->check() ? auth()->user()->tenant_id : null,
                    'user_id' => auth()->id(),
                    'level' => 'error',
                    'message' => substr($e->getMessage(), 0, 5000), // Prevent very long messages
                    'exception_class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => array_slice($e->getTrace(), 0, 10),
                    'url' => request()->fullUrl(),
                    'ip_address' => request()->ip(),
                ]);
            } catch (\Throwable $loggingException) {
                // Ignore logging errors to prevent infinite loops
            }
        });

        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('/dashboard') || $request->is('/')) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        });
    })->create();

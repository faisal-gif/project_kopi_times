<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\CaptureReferralCode::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            '/checkout/payment',
        ]);
        // Kode referral bukan data sensitif dan harus tetap terbaca walau APP_KEY dirotasi.
        // Nilainya sama dengan config('affiliate.cookie_name').
        $middleware->encryptCookies(except: [
            'kt_ref',
        ]);
        $middleware->alias([
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

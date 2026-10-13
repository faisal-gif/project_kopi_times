<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Halaman afiliasi hanya untuk akun yang ditautkan admin ke baris `affiliates`
 * berstatus aktif. Sengaja tidak memakai middleware `active`: afiliator belum
 * tentu member berbayar.
 */
class EnsureUserIsAffiliate
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->affiliate?->isActive(), 403);

        return $next($request);
    }
}

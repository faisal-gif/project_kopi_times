<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menyimpan kode referral dari ?ref= ke cookie.
 *
 * Sentuhan pertama yang menang: cookie yang sudah ada tidak ditimpa, supaya
 * afiliator yang pertama memperkenalkan Kopi TIMES tidak kehilangan haknya.
 * Tidak ada tulisan ke database di sini — atribusi baru dikunci saat pendaftaran.
 */
class CaptureReferralCode
{
    public function handle(Request $request, Closure $next): Response
    {
        $code = strtoupper(trim((string) $request->query('ref')));
        $cookie = config('affiliate.cookie_name');

        if ($code !== '' && preg_match('/^[A-Z0-9]{3,32}$/', $code) && ! $request->cookie($cookie)) {
            Cookie::queue($cookie, $code, config('affiliate.cookie_days') * 1440);
        }

        return $next($request);
    }
}

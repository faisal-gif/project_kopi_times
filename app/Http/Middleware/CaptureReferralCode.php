<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menyimpan kode referral dari ?ref= ke cookie.
 *
 * Sentuhan terakhir yang menang: link yang baru dibuka menimpa cookie lama, dan
 * masa berlakunya ikut dihitung ulang dari klik terakhir. Afiliator yang paling
 * dekat dengan keputusan mendaftar itulah yang dicatat.
 * Tidak ada tulisan ke database di sini — atribusi baru dikunci saat pendaftaran.
 */
class CaptureReferralCode
{
    public function handle(Request $request, Closure $next): Response
    {
        $code = strtoupper(trim((string) $request->query('ref')));
        $cookie = config('affiliate.cookie_name');

        if ($code !== '' && preg_match('/^[A-Z0-9]{3,32}$/', $code)) {
            // cookie_domain diisi '.times.co.id' bila atribusi harus berlaku lintas subdomain.
            Cookie::queue(
                $cookie,
                $code,
                config('affiliate.cookie_days') * 1440,
                '/',
                config('affiliate.cookie_domain'),
            );
        }

        return $next($request);
    }
}

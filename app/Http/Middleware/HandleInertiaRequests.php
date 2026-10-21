<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                // null bila belum pernah mengajukan; selain itu status barisnya.
                // Dipakai sidebar untuk memutuskan menu Afiliasi muncul atau tidak.
                'affiliate_status' => fn () => $request->user()?->affiliate?->status,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            /*
             * Pesan flash. Sebelum ini tidak pernah dibagikan, sehingga setiap
             * `back()->with('error', ...)` di aplikasi ini — termasuk kegagalan
             * membuat transaksi Tripay di PaymentController::store() — tidak pernah
             * terlihat user. Halaman pembayaran bergantung pada ini.
             */
            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}

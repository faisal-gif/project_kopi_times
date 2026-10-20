<?php

namespace App\Http\Controllers;

use App\Http\Requests\AffiliateApplicationRequest;
use App\Models\Affiliate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengajuan diri jadi afiliator. Hanya member aktif (rute memakai middleware `active`).
 * Hasilnya baris `affiliates` berstatus `pending` yang ditinjau admin lewat CMS.
 */
class AffiliateApplicationController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user->affiliate()->exists()) {
            return redirect()->route('afiliasi.index');
        }

        return Inertia::render('Afiliasi/Daftar', [
            'profile' => [
                'name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->contact,
            ],
            'terms_url' => route('afiliasi.syarat'),
            'min_payout' => (int) config('affiliate.min_payout'),
        ]);
    }

    public function store(AffiliateApplicationRequest $request): RedirectResponse
    {
        $user = $request->user();

        Affiliate::create([
            // Situs tempat ia mendaftar; menentukan dari pendaftar mana ia berkomisi.
            'type' => (int) config('affiliate.site_type'),
            'user_id' => $user->id,
            /*
             * SENGAJA kosong: upline menentukan siapa menerima komisi tingkat 2 (5%),
             * dan itu keputusan admin, bukan kesimpulan sistem.
             *
             * Pernah diisi otomatis dari afiliator yang merekrut orang ini jadi member
             * (2026-10-19), lalu dibatalkan sehari kemudian atas permintaan pemilik
             * produk: penerima 5% harus ditentukan admin. Jangan dihidupkan lagi tanpa
             * keputusan baru — lihat ADR 0001 keputusan 9a.
             *
             * Konsekuensinya: selama upline kosong, setiap komisi tingkat 2 dari
             * afiliator ini lahir berstatus `unassigned` dan menunggu admin, jadi layar
             * Baris Tertahan di CMS wajib dipantau.
             */
            'upline_id' => null,
            'code' => Affiliate::generateCode($request->name),
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'payout_method' => $request->payout_method,
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->bank_account_number,
            'bank_account_name' => $request->bank_account_name,
            'applicant_note' => $request->applicant_note,
            'terms_accepted_at' => now(),
            'status' => 'pending',
        ]);

        return redirect()->route('afiliasi.index')
            ->with('success', 'Pengajuan terkirim. Tim kami akan meninjau dalam beberapa hari kerja.');
    }
}

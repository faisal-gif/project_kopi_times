<?php

namespace App\Http\Controllers;

use App\Http\Requests\AffiliateApplicationRequest;
use App\Models\Affiliate;
use App\Models\AffiliateReferral;
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
            // Diturunkan dari pengundangnya, tapi HANYA bila akun itu dicentang admin
            // sebagai berhak menerima komisi 5%. Lihat uplineDariPengundang().
            'upline_id' => $this->uplineDariPengundang($user),
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

    /**
     * Upline pemohon: afiliator yang dulu mengundang orang ini jadi member.
     *
     * Yang ditentukan admin BUKAN siapa uplinenya, melainkan akun mana yang berhak
     * menerima komisi tingkat 2 — lewat penanda `affiliates.tier2_eligible` di CMS.
     * Rantainya sendiri diturunkan dari data referral, karena hanya data itu yang tahu
     * siapa benar-benar mengundang siapa.
     *
     * Null — tidak ada upline, dan jaringan orang ini tidak menghasilkan 5% bagi
     * siapa pun — bila pengundangnya:
     *   - tidak ada (mendaftar tanpa link referral);
     *   - TIDAK dicentang sebagai berhak menerima komisi 5%;
     *   - bukan afiliator `active`;
     *   - milik situs lain, karena komisi tingkat 2 tidak boleh melintasi situs.
     *
     * Lingkaran tidak perlu diperiksa: baris yang baru dibuat belum ditunjuk siapa pun
     * sebagai upline, jadi rantainya tidak bisa menutup.
     */
    private function uplineDariPengundang($user): ?int
    {
        $pengundang = AffiliateReferral::where('user_id', $user->id)->first()?->affiliate;

        if (! $pengundang || ! $pengundang->tier2_eligible) {
            return null;
        }

        if (! $pengundang->isActive()) {
            return null;
        }

        if ((int) $pengundang->type !== (int) config('affiliate.site_type')) {
            return null;
        }

        return $pengundang->id;
    }
}

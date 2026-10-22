<?php

namespace App\Http\Controllers;

use App\Http\Requests\AffiliateApplicationRequest;
use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengajuan diri jadi afiliator. Hanya member aktif (rute memakai middleware `active`).
 * Hasilnya baris `affiliates` berstatus `pending` yang ditinjau admin lewat CMS.
 */
class AffiliateApplicationController extends Controller
{
    /**
     * Tautan undangan jadi afiliator: /undang-afiliator/{kode}.
     *
     * Rutenya publik dan sengaja bodoh — ia hanya menitipkan kode ke cookie, lalu
     * melempar ke formulir. Keabsahan pengundang diperiksa belakangan, saat pengajuan
     * benar-benar dikirim, karena statusnya bisa berubah di antara klik dan pengajuan.
     *
     * Cookie-nya perlu: formulir ada di balik `auth`, jadi tamu akan dilempar ke login
     * (bahkan ke pendaftaran member dulu) dan query string-nya hilang di tengah jalan.
     */
    public function undangan(string $code): RedirectResponse
    {
        $code = strtoupper(trim($code));

        if (preg_match('/^[A-Z0-9]{3,32}$/', $code)) {
            Cookie::queue(
                config('affiliate.invite_cookie_name'),
                $code,
                config('affiliate.cookie_days') * 1440,
                '/',
                config('affiliate.cookie_domain'),
            );
        }

        return redirect()->route('afiliasi.daftar');
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user->affiliate()->exists()) {
            return redirect()->route('afiliasi.index');
        }

        $pengundang = $this->pengundangDariUndangan($request);

        return Inertia::render('Afiliasi/Daftar', [
            'profile' => [
                'name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->contact,
            ],
            // Hanya untuk ditampilkan. Yang menentukan upline tetap pemeriksaan di store().
            'pengundang' => $pengundang ? ['name' => $pengundang->name] : null,
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
            // Undangan langsung menang atas rantai referral: ia perbuatan sengaja,
            // sedangkan rantai referral cuma diturunkan dari riwayat pendaftaran member.
            'upline_id' => $this->uplineBilaBerhak($this->pengundangDariUndangan($request))
                ?? $this->uplineBilaBerhak($this->pengundangDariReferral($user)),
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

        // Undangan sudah terpakai; membiarkannya hanya menyesatkan pengajuan berikutnya.
        Cookie::queue(Cookie::forget(config('affiliate.invite_cookie_name'), '/', config('affiliate.cookie_domain')));

        return redirect()->route('afiliasi.index')
            ->with('success', 'Pengajuan terkirim. Tim kami akan meninjau dalam beberapa hari kerja.');
    }

    /** Afiliator yang mengundang orang ini jadi afiliator, lewat tautan undangan. */
    private function pengundangDariUndangan(Request $request): ?Affiliate
    {
        return Affiliate::resolveByCode(
            $request->query('undangan') ?: $request->cookie(config('affiliate.invite_cookie_name')),
        );
    }

    /** Afiliator yang dulu mengundang orang ini jadi member biasa. */
    private function pengundangDariReferral($user): ?Affiliate
    {
        return AffiliateReferral::where('user_id', $user->id)->first()?->affiliate;
    }

    /**
     * Pengundang hanya jadi upline bila ia memang berhak menerima komisi tingkat 2.
     *
     * Yang ditentukan admin BUKAN siapa uplinenya, melainkan akun mana yang berhak
     * menerima komisi 5% — lewat penanda `affiliates.tier2_eligible` di CMS.
     *
     * Null — tidak ada upline, dan jaringan orang ini tidak menghasilkan 5% bagi
     * siapa pun — bila pengundangnya:
     *   - tidak ada (tanpa undangan maupun link referral);
     *   - TIDAK dicentang sebagai berhak menerima komisi 5%;
     *   - bukan afiliator `active`;
     *   - milik situs lain, karena komisi tingkat 2 tidak boleh melintasi situs.
     *
     * Lingkaran tidak perlu diperiksa: baris yang baru dibuat belum ditunjuk siapa pun
     * sebagai upline, jadi rantainya tidak bisa menutup. Mengundang diri sendiri juga
     * mustahil — AffiliateApplicationRequest menolak user yang sudah punya baris afiliator.
     */
    private function uplineBilaBerhak(?Affiliate $pengundang): ?int
    {
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

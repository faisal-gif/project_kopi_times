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
        $siteType = (int) config('affiliate.site_type');

        Affiliate::create([
            // Situs tempat ia mendaftar; menentukan dari pendaftar mana ia berkomisi.
            'type' => $siteType,
            'user_id' => $user->id,
            // Diisi otomatis dari perekrut member ini; null bila tidak memenuhi syarat.
            // Admin tetap bisa menimpanya di CMS — ini hanya nilai awal.
            'upline_id' => $this->uplineDariPerekrut($user, $siteType),
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
     * Upline awal: afiliator yang dulu membawa orang ini mendaftar jadi member.
     *
     * Mengembalikan null — dan uplinenya tetap ditetapkan admin — bila:
     *   - orang ini tidak mendaftar lewat link referral siapa pun;
     *   - perekrutnya bukan afiliator `active` (pending, ditangguhkan, nonaktif);
     *   - perekrutnya milik situs lain, karena komisi tingkat 2 tidak boleh melintasi situs.
     *
     * Tidak ada pemeriksaan lingkaran di sini, dan memang tidak perlu: baris afiliator
     * yang baru dibuat belum ditunjuk siapa pun sebagai upline, jadi rantainya tidak
     * bisa menutup. Menunjuk diri sendiri juga mustahil karena
     * AffiliateApplicationRequest::authorize() menolak user yang sudah punya baris
     * afiliator. Perubahan upline belakangan tetap dijaga pemeriksaan lingkaran di CMS.
     */
    private function uplineDariPerekrut($user, int $siteType): ?int
    {
        $perekrut = AffiliateReferral::where('user_id', $user->id)->first()?->affiliate;

        if (! $perekrut || ! $perekrut->isActive()) {
            return null;
        }

        if ((int) $perekrut->type !== $siteType) {
            return null;
        }

        return $perekrut->id;
    }
}

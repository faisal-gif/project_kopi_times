<?php

namespace App\Http\Controllers;

use App\Models\AffiliateCommission;
use App\Models\AffiliatePayout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $affiliate = Auth::user()->affiliate;

        // Belum pernah mengajukan: arahkan ke formulir.
        if (! $affiliate) {
            return redirect()->route('afiliasi.daftar');
        }

        // Pengajuan belum ditinjau: tampilkan status saja, belum ada angka apa pun.
        if ($affiliate->status === 'pending') {
            return Inertia::render('Afiliasi/Index', [
                'affiliate' => [
                    'name' => $affiliate->name,
                    'status' => $affiliate->status,
                    'status_label' => $affiliate->status_label,
                    'applied_at' => $affiliate->created_at,
                ],
            ]);
        }

        // scopeOwnedBy sudah membuang pos internal; pos itu memang tak pernah punya penerima.
        $commissions = AffiliateCommission::ownedBy($affiliate->id)
            ->with('user:id,nama')
            ->latest()
            ->paginate(15)
            ->through(fn ($c) => [
                'id' => $c->id,
                'date' => $c->created_at,
                'member' => $c->user?->nama ?? 'Member',
                'role_label' => $c->role_label,
                'amount' => $c->amount,
                'status' => $c->status,
                'status_label' => $c->status_label,
                'available_at' => $c->available_at,
            ]);

        $totals = AffiliateCommission::ownedBy($affiliate->id)
            ->selectRaw("
                COUNT(*) AS jumlah,
                COALESCE(SUM(CASE WHEN status IN ('accrued','unassigned') THEN amount END), 0) AS tertahan,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount END), 0) AS siap_cair,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount END), 0) AS dibayar
            ")
            ->first();

        return Inertia::render('Afiliasi/Index', [
            'affiliate' => [
                'name' => $affiliate->name,
                'code' => $affiliate->code,
                'referral_url' => $affiliate->referral_url,
                'status' => $affiliate->status,
                'status_label' => $affiliate->status_label,
            ],
            'summary' => [
                'referrals' => $affiliate->referrals()->count(),
                'commissions' => (int) $totals->jumlah,
                'held' => (int) $totals->tertahan,
                'payable' => (int) $totals->siap_cair,
                'paid' => (int) $totals->dibayar,
            ],
            'min_payout' => (int) config('affiliate.min_payout'),
            'commissions' => $commissions,
            'payouts' => AffiliatePayout::ownedBy($affiliate->id)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'date' => $p->paid_at ?? $p->created_at,
                    'amount' => $p->amount,
                    'status' => $p->status,
                    'status_label' => $p->status_label,
                    'reference' => $p->reference,
                ]),
        ]);
    }
}

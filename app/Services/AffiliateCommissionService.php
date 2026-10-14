<?php

namespace App\Services;

use App\Models\AffiliateCommission;
use App\Models\AffiliateReferral;
use App\Models\Payments;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pencatat komisi afiliasi.
 *
 * accrue() dipanggil dari dalam transaksi callback Tripay, saat pembayaran jadi lunas.
 * Semua uang bilangan bulat rupiah; net kantor tidak pernah jadi baris, melainkan
 * sisa dari `payment.amount - SUM(amount)`, sehingga pembulatan ke bawah selalu
 * jatuh ke kantor dan total baris tidak mungkin melebihi nilai pembayaran.
 */
class AffiliateCommissionService
{
    /**
     * Pembagian untuk satu nilai pembayaran.
     *
     * tier1 dihitung dari harga, tier2 dan internal dari sisa setelah tier1.
     * 48.000 -> 9.600 / 1.920 / 3.840, sisa kantor 32.640.
     *
     * @return array<int, array{role: string, base_amount: int, rate_bps: int, amount: int}>
     */
    public static function split(int $amount): array
    {
        $tier1Bps = (int) config('affiliate.tier1_bps');
        $tier2Bps = (int) config('affiliate.tier2_bps');
        $internalBps = (int) config('affiliate.internal_bps');

        $tier1 = intdiv($amount * $tier1Bps, 10_000);
        $gross = $amount - $tier1;

        return [
            ['role' => 'tier1', 'base_amount' => $amount, 'rate_bps' => $tier1Bps, 'amount' => $tier1],
            ['role' => 'tier2', 'base_amount' => $gross, 'rate_bps' => $tier2Bps, 'amount' => intdiv($gross * $tier2Bps, 10_000)],
            ['role' => 'internal', 'base_amount' => $gross, 'rate_bps' => $internalBps, 'amount' => intdiv($gross * $internalBps, 10_000)],
        ];
    }

    /**
     * Catat komisi untuk satu pembayaran lunas. Mengembalikan jumlah baris yang dibuat.
     *
     * Dipanggil di dalam transaksi callback, saat baris payment dan user sudah terkunci.
     */
    public function accrue(Payments $payment): int
    {
        if (! config('affiliate.enabled')) {
            return 0;
        }

        $referral = AffiliateReferral::with('affiliate.upline')
            ->where('user_id', $payment->user_id)
            ->first();

        // Tanpa perekrut tidak ada pos apa pun, termasuk pos internal: harga utuh ke kantor.
        if (! $referral || ! $referral->affiliate) {
            return 0;
        }

        if (! $referral->affiliate->isActive()) {
            Log::info('Komisi dilewati: afiliator tidak aktif.', [
                'payment_id' => $payment->id,
                'affiliate_id' => $referral->affiliate_id,
                'status' => $referral->affiliate->status,
            ]);

            return 0;
        }

        if (! $this->isNewMemberSale($payment)) {
            return 0;
        }

        // Afiliator hanya berkomisi dari pendaftar di situs yang sama dengan type-nya.
        // 1 = AJP, 4 = Kopi TIMES. Referral lintas situs tetap tercatat, tapi tidak berkomisi.
        $siteType = (int) $payment->newsPackage?->type;

        if ((int) $referral->affiliate->type !== $siteType) {
            Log::info('Komisi dilewati: situs afiliator berbeda dengan paket yang dibeli.', [
                'payment_id' => $payment->id,
                'affiliate_id' => $referral->affiliate_id,
                'affiliate_type' => $referral->affiliate->type,
                'package_type' => $siteType,
            ]);

            return 0;
        }

        $source = $referral->affiliate;
        $upline = $source->upline;
        $availableAt = ($payment->paid_at ?? now())->copy()->addDays((int) config('affiliate.hold_days'));
        $now = now();

        $rows = [];
        foreach (self::split((int) $payment->amount) as $position) {
            // tier1 ke perekrut; tier2 ke uplinenya, atau tertahan bila tidak ada;
            // internal tidak pernah punya penerima.
            $payee = match ($position['role']) {
                'tier1' => $source->id,
                'tier2' => $upline?->id,
                default => null,
            };

            $rows[] = $position + [
                'type' => $siteType,
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
                'affiliate_id' => $payee,
                'source_affiliate_id' => $source->id,
                'status' => ($position['role'] === 'tier2' && ! $upline) ? 'unassigned' : 'accrued',
                'available_at' => $availableAt,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // insertOrIgnore + unique(payment_id, role): callback ganda jadi no-op diam-diam,
        // bukan exception yang membuat Tripay mengulang terus.
        DB::table('affiliate_commissions')->insertOrIgnore($rows);

        return count($rows);
    }

    /**
     * Batalkan komisi sebuah pembayaran, mis. saat refund diproses manual.
     * Hanya baris yang belum final yang dibalik.
     */
    public function reverse(Payments $payment, string $reason): int
    {
        return AffiliateCommission::where('payment_id', $payment->id)
            ->whereIn('status', ['accrued', 'unassigned', 'approved', 'paid'])
            ->update(['status' => 'reversed', 'status_note' => $reason]);
    }

    /**
     * Pembelian member baru: paket pendaftaran (level 1) DAN belum pernah ada
     * pembayaran lunas lain. Syarat kedua menutup celah member lama yang
     * membeli ulang paket level 1 setelah masa aktifnya habis.
     */
    private function isNewMemberSale(Payments $payment): bool
    {
        if ((int) ($payment->newsPackage?->level) !== 1) {
            return false;
        }

        return ! Payments::where('user_id', $payment->user_id)
            ->where('status', 'paid')
            ->whereKeyNot($payment->id)
            ->exists();
    }
}

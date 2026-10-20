<?php

namespace App\Services;

use App\Models\Affiliate;
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
     * Tanpa perekrut hanya pos internal yang terbit, dan dasarnya harga utuh
     * karena tidak ada potongan tier1: 48.000 -> 4.800, sisa kantor 43.200.
     * base_amount selalu angka yang benar-benar terjadi, bukan potongan khayalan.
     *
     * @return array<int, array{role: string, base_amount: int, rate_bps: int, amount: int}>
     */
    public static function split(int $amount, bool $adaPerekrut = true): array
    {
        $tier1Bps = (int) config('affiliate.tier1_bps');
        $tier2Bps = (int) config('affiliate.tier2_bps');
        $internalBps = (int) config('affiliate.internal_bps');
        $internalFlat = (int) config('affiliate.internal_flat');

        $tier1 = $adaPerekrut ? intdiv($amount * $tier1Bps, 10_000) : 0;
        $gross = $amount - $tier1;

        // Pos internal = persentase + komponen tetap. flat_amount di-snapshot supaya
        // barisnya tetap bisa dihitung ulang: base*rate/10000 + flat = amount.
        $internal = [
            'role' => 'internal',
            'base_amount' => $gross,
            'rate_bps' => $internalBps,
            'flat_amount' => $internalFlat,
            'amount' => intdiv($gross * $internalBps, 10_000) + $internalFlat,
        ];

        $posisi = $adaPerekrut
            ? [
                ['role' => 'tier1', 'base_amount' => $amount, 'rate_bps' => $tier1Bps, 'flat_amount' => 0, 'amount' => $tier1],
                ['role' => 'tier2', 'base_amount' => $gross, 'rate_bps' => $tier2Bps, 'flat_amount' => 0, 'amount' => intdiv($gross * $tier2Bps, 10_000)],
                $internal,
            ]
            : [$internal];

        // Tarif 0 berarti pos itu tidak berlaku di situs ini — AJP satu tingkat, jadi
        // tier2_bps 0. Posnya dibuang, bukan dicatat sebagai baris bernilai nol:
        // baris nol akan muncul di laporan, menumpuk sebagai `unassigned` saat tidak
        // ada upline, dan minta disetujui admin padahal tidak ada uang di dalamnya.
        $posisi = array_values(array_filter($posisi, fn ($p) => $p['rate_bps'] > 0));

        return self::jagaNetKantor($posisi, $amount);
    }

    /**
     * Net kantor tidak boleh negatif.
     *
     * Selama semua pos berupa persentase, totalnya mustahil melebihi nilai pembayaran.
     * Komponen tetap merusak jaminan itu: pada harga paket kecil, Rp 1.000 bisa membuat
     * total pos melampaui yang dibayar pembeli — artinya kantor membayar lebih dari
     * yang diterima. Jadi yang dipangkas HANYA komponen tetapnya, bukan persentase
     * milik afiliator, dan hanya sebesar kelebihannya.
     *
     * Pada harga yang berlaku sekarang (48.000 dan 250.000) ini tidak pernah aktif.
     */
    private static function jagaNetKantor(array $posisi, int $amount): array
    {
        $kelebihan = array_sum(array_column($posisi, 'amount')) - $amount;

        if ($kelebihan <= 0) {
            return $posisi;
        }

        foreach ($posisi as $i => $pos) {
            if ($kelebihan <= 0 || $pos['flat_amount'] <= 0) {
                continue;
            }

            $pangkas = min($kelebihan, $pos['flat_amount']);
            $posisi[$i]['flat_amount'] -= $pangkas;
            $posisi[$i]['amount'] -= $pangkas;
            $kelebihan -= $pangkas;
        }

        return $posisi;
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

        // Pintu utama untuk SEMUA pos, termasuk internal: hanya pendaftaran
        // member baru. Perpanjangan tidak pernah menghasilkan baris apa pun.
        if (! $this->isNewMemberSale($payment)) {
            return 0;
        }

        // 1 = AJP, 4 = Kopi TIMES.
        $siteType = (int) $payment->newsPackage?->type;

        $source = $this->perekrutBerhakKomisi($payment, $siteType);
        $upline = $source?->upline;
        $availableAt = ($payment->paid_at ?? now())->copy()->addDays((int) config('affiliate.hold_days'));
        $now = now();

        $rows = [];
        foreach (self::split((int) $payment->amount, $source !== null) as $position) {
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
                'source_affiliate_id' => $source?->id,
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
     * Perekrut yang benar-benar berhak atas komisi tingkat 1 dan 2.
     *
     * Null berarti penjualan ini tidak punya perekrut yang berhak — tidak ada
     * referral, afiliatornya tidak aktif, atau afiliatornya milik situs lain.
     * Ketiganya diperlakukan sama: kantor menyimpan harga utuh, sehingga pos
     * internal tetap terbit dan tim IT tidak kehilangan bagiannya.
     */
    private function perekrutBerhakKomisi(Payments $payment, int $siteType): ?Affiliate
    {
        $referral = AffiliateReferral::with('affiliate.upline')
            ->where('user_id', $payment->user_id)
            ->first();

        if (! $referral || ! $referral->affiliate) {
            return null;
        }

        if (! $referral->affiliate->isActive()) {
            Log::info('Komisi perekrut dilewati: afiliator tidak aktif.', [
                'payment_id' => $payment->id,
                'affiliate_id' => $referral->affiliate_id,
                'status' => $referral->affiliate->status,
            ]);

            return null;
        }

        // Afiliator hanya berkomisi dari pendaftar di situs yang sama dengan type-nya.
        // Referral lintas situs tetap tercatat, tapi tidak berkomisi.
        if ((int) $referral->affiliate->type !== $siteType) {
            Log::info('Komisi perekrut dilewati: situs afiliator berbeda dengan paket yang dibeli.', [
                'payment_id' => $payment->id,
                'affiliate_id' => $referral->affiliate_id,
                'affiliate_type' => $referral->affiliate->type,
                'package_type' => $siteType,
            ]);

            return null;
        }

        return $referral->affiliate;
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

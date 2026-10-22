<?php

namespace Tests\Feature\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateReferral;
use App\Models\Payments;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

/**
 * Undangan jadi afiliator: /undang-afiliator/{kode}.
 *
 * Jalur ini melengkapi rantai lama yang hanya bisa terbentuk bila si pemohon dulu
 * mendaftar jadi member lewat link referral pengundangnya. Dengan undangan, afiliator
 * yang dicentang bisa menarik member mana pun jadi downline-nya.
 *
 * Syarat pengundang tetap sama persis dengan rantai lama — dicentang berhak komisi
 * tingkat 2, berstatus aktif, dan satu situs.
 */
class UndanganAfiliatorTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();
        Mail::fake();
        config(['services.tripay.private_key' => 'kunci-uji']);

        DB::table('news_package')->insert([
            ['id' => 1, 'name' => 'Mulai Menulis', 'level' => 1, 'type' => '4', 'status' => 1, 'price' => 48000, 'period' => 1, 'jenis_periode' => 'bulan', 'quota' => 4],
        ]);
    }

    private function ajukanJadiAfiliator(User $user, string $nama, ?string $kodeUndangan = null): Affiliate
    {
        $test = $kodeUndangan
            ? $this->withUnencryptedCookie(config('affiliate.invite_cookie_name'), $kodeUndangan)
            : $this;

        $test->actingAs($user)->post('/afiliasi/daftar', [
            'name' => $nama,
            'email' => strtolower(str_replace(' ', '', $nama)) . '@contoh.test',
            'phone' => '81234567890',
            'payout_method' => 'bank',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => $nama,
            'terms' => true,
        ])->assertRedirect(route('afiliasi.index'));

        return Affiliate::where('user_id', $user->id)->sole();
    }

    public function test_tautan_undangan_menitipkan_kode_dan_melempar_ke_formulir(): void
    {
        $this->get('/undang-afiliator/AKUNA123')
            ->assertRedirect(route('afiliasi.daftar'))
            ->assertPlainCookie(config('affiliate.invite_cookie_name'), 'AKUNA123');
    }

    /** Kode ngawur tidak menggagalkan apa pun; ia hanya tidak dititipkan. */
    public function test_kode_tidak_berbentuk_kode_diabaikan(): void
    {
        $this->get('/undang-afiliator/ab')
            ->assertRedirect(route('afiliasi.daftar'))
            ->assertCookieMissing(config('affiliate.invite_cookie_name'));
    }

    public function test_undangan_dari_akun_dicentang_mengisi_upline(): void
    {
        $a = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'AKUNA123']);

        // Member ini tidak pernah direkrut siapa pun — buktinya uplinenya datang dari undangan.
        $afiliatorB = $this->ajukanJadiAfiliator(User::factory()->active()->create(), 'Akun B', 'AKUNA123');

        $this->assertSame($a->id, $afiliatorB->upline_id);
    }

    public function test_undangan_dari_akun_tanpa_centang_tidak_mengisi_upline(): void
    {
        Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => false, 'code' => 'AKUNA123']);

        $afiliatorB = $this->ajukanJadiAfiliator(User::factory()->active()->create(), 'Akun B', 'AKUNA123');

        $this->assertNull($afiliatorB->upline_id);
    }

    public function test_undangan_dari_afiliator_situs_lain_tidak_mengisi_upline(): void
    {
        Affiliate::factory()->create(['type' => 1, 'tier2_eligible' => true, 'code' => 'AKUNA123']);

        $afiliatorB = $this->ajukanJadiAfiliator(User::factory()->active()->create(), 'Akun B', 'AKUNA123');

        $this->assertNull($afiliatorB->upline_id);
    }

    public function test_undangan_dari_afiliator_ditangguhkan_tidak_mengisi_upline(): void
    {
        Affiliate::factory()->suspended()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'AKUNA123']);

        $afiliatorB = $this->ajukanJadiAfiliator(User::factory()->active()->create(), 'Akun B', 'AKUNA123');

        $this->assertNull($afiliatorB->upline_id);
    }

    /**
     * Undangan adalah perbuatan sengaja; rantai referral cuma diturunkan dari riwayat.
     * Kalau keduanya ada dan berbeda, yang mengundang jadi afiliator-lah yang dipakai.
     */
    public function test_undangan_menang_atas_rantai_referral(): void
    {
        $perekrutMember = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'PEREKRUT1']);
        $pengundang = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'AKUNA123']);

        $user = User::factory()->active()->create();
        AffiliateReferral::create([
            'type' => 4,
            'user_id' => $user->id,
            'affiliate_id' => $perekrutMember->id,
            'code' => $perekrutMember->code,
            'source' => 'link',
        ]);

        $afiliatorB = $this->ajukanJadiAfiliator($user, 'Akun B', 'AKUNA123');

        $this->assertSame($pengundang->id, $afiliatorB->upline_id);
    }

    /** Pengundang tak berhak tidak membatalkan rantai referral yang sudah sah. */
    public function test_undangan_tak_berhak_jatuh_kembali_ke_rantai_referral(): void
    {
        $perekrutMember = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'PEREKRUT1']);
        Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => false, 'code' => 'AKUNA123']);

        $user = User::factory()->active()->create();
        AffiliateReferral::create([
            'type' => 4,
            'user_id' => $user->id,
            'affiliate_id' => $perekrutMember->id,
            'code' => $perekrutMember->code,
            'source' => 'link',
        ]);

        $afiliatorB = $this->ajukanJadiAfiliator($user, 'Akun B', 'AKUNA123');

        $this->assertSame($perekrutMember->id, $afiliatorB->upline_id);
    }

    /**
     * Inti permintaannya, diuji sampai uangnya tercatat:
     * A mengundang B jadi afiliator -> B membawa pendaftar C -> A dapat 5%.
     */
    public function test_pengundang_menerima_lima_persen_dari_pendaftar_yang_dibawa_undangannya(): void
    {
        $a = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'code' => 'AKUNA123']);

        $afiliatorB = $this->ajukanJadiAfiliator(User::factory()->active()->create(), 'Akun B', 'AKUNA123');
        $afiliatorB->update(['status' => 'active']);          // admin menyetujui

        $c = User::factory()->active()->create();
        AffiliateReferral::create([
            'type' => 4,
            'user_id' => $c->id,
            'affiliate_id' => $afiliatorB->id,
            'code' => $afiliatorB->code,
            'source' => 'link',
        ]);
        $this->bayarLunas($c);

        $komisi = AffiliateCommission::get()->keyBy('role');
        $this->assertSame($afiliatorB->id, $komisi['tier1']->affiliate_id, 'B dapat 20%');
        $this->assertSame(9600, (int) $komisi['tier1']->amount);
        $this->assertSame($a->id, $komisi['tier2']->affiliate_id, 'A dapat 5% karena mengundang B');
        $this->assertSame(1920, (int) $komisi['tier2']->amount);
    }

    private function bayarLunas(User $user): void
    {
        $payment = Payments::create([
            'user_id' => $user->id,
            'package_id' => 1,
            'merchant_ref' => 'SUB-' . uniqid(),
            'reference' => 'T' . uniqid(),
            'method' => 'QRIS',
            'amount' => 48000,
            'status' => 'pending',
            'paid_at' => null,
        ]);

        $json = json_encode([
            'reference' => $payment->reference,
            'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 0, 'total_fee' => 0,
            'total_amount' => 48000, 'amount_received' => 48000,
        ]);

        $this->call('POST', '/api/tripay/callback', [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json',
             'HTTP_X_CALLBACK_SIGNATURE' => hash_hmac('sha256', $json, 'kunci-uji')],
            $json)->assertOk();
    }
}

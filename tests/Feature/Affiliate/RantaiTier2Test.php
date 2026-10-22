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
 * Rantai penuh yang diminta pemilik produk, diuji ujung ke ujung:
 *
 *   A dicentang "boleh menerima komisi 5%"
 *   A mengundang B  -> A dapat 20% dari pendaftaran B
 *   B jadi afiliator -> uplinenya A (otomatis, karena A dicentang)
 *   B mengundang C  -> B dapat 20%, A dapat 5%
 *
 * Lawannya juga diuji: bila A TIDAK dicentang, rantainya tidak terbentuk dan
 * tidak ada 5% untuk siapa pun.
 */
class RantaiTier2Test extends TestCase
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

    private function bayarLunas(User $user): Payments
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

        $body = [
            'reference' => $payment->reference,
            'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 0, 'total_fee' => 0,
            'total_amount' => 48000, 'amount_received' => 48000,
        ];
        $json = json_encode($body);

        $this->call('POST', '/api/tripay/callback', [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json',
             'HTTP_X_CALLBACK_SIGNATURE' => hash_hmac('sha256', $json, 'kunci-uji')],
            $json)->assertOk();

        return $payment->fresh();
    }

    private function daftarkanLewat(Affiliate $pengundang): User
    {
        $user = User::factory()->active()->create();
        AffiliateReferral::create([
            'type' => $pengundang->type,
            'user_id' => $user->id,
            'affiliate_id' => $pengundang->id,
            'code' => $pengundang->code,
            'source' => 'link',
        ]);

        return $user;
    }

    private function ajukanJadiAfiliator(User $user, string $nama): Affiliate
    {
        $this->actingAs($user)->post('/afiliasi/daftar', [
            'name' => $nama,
            'email' => strtolower(str_replace(' ', '', $nama)) . '@contoh.test',
            'phone' => '81234567890',
            'payout_method' => 'bank',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => $nama,
            'terms' => true,
        ])->assertRedirect(route('afiliasi.index'));

        $baru = Affiliate::where('user_id', $user->id)->sole();
        $baru->update(['status' => 'active']);   // admin menyetujui

        return $baru->fresh();
    }

    public function test_rantai_penuh_saat_akun_dicentang(): void
    {
        $a = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => true, 'name' => 'Akun A']);

        // --- A mengundang B, B membayar
        $b = $this->daftarkanLewat($a);
        $this->bayarLunas($b);

        $komisiB = AffiliateCommission::get()->keyBy('role');
        $this->assertSame(9600, (int) $komisiB['tier1']->amount, 'A harus dapat 20% dari pendaftaran B');
        $this->assertSame($a->id, $komisiB['tier1']->affiliate_id);
        // B belum punya upline, jadi tier2 dari pendaftaran B tidak terbit sama sekali.
        $this->assertFalse($komisiB->has('tier2'));

        // --- B jadi afiliator: uplinenya harus A, otomatis
        $afiliatorB = $this->ajukanJadiAfiliator($b, 'Akun B');
        $this->assertSame($a->id, $afiliatorB->upline_id, 'upline B harus A karena A dicentang');

        // --- B mengundang C, C membayar
        AffiliateCommission::query()->delete();
        $c = $this->daftarkanLewat($afiliatorB);
        $this->bayarLunas($c);

        $komisiC = AffiliateCommission::get()->keyBy('role');
        $this->assertSame(9600, (int) $komisiC['tier1']->amount);
        $this->assertSame($afiliatorB->id, $komisiC['tier1']->affiliate_id, 'B dapat 20%');
        $this->assertSame(1920, (int) $komisiC['tier2']->amount);
        $this->assertSame($a->id, $komisiC['tier2']->affiliate_id, 'A dapat 5% dari jaringannya');
        $this->assertSame('accrued', $komisiC['tier2']->status);
        $this->assertSame(8840, (int) $komisiC['internal']->amount);
    }

    public function test_tanpa_centang_rantai_tidak_terbentuk(): void
    {
        $a = Affiliate::factory()->create(['type' => 4, 'tier2_eligible' => false, 'name' => 'Akun A']);

        $b = $this->daftarkanLewat($a);
        $afiliatorB = $this->ajukanJadiAfiliator($b, 'Akun B');

        $this->assertNull($afiliatorB->upline_id, 'tanpa centang, upline B harus kosong');

        AffiliateCommission::query()->delete();
        $c = $this->daftarkanLewat($afiliatorB);
        $this->bayarLunas($c);

        $komisi = AffiliateCommission::get()->keyBy('role');
        $this->assertSame($afiliatorB->id, $komisi['tier1']->affiliate_id, 'B tetap dapat 20%');
        $this->assertFalse($komisi->has('tier2'), 'tanpa upline, pos 5% tidak diterbitkan');
    }
}

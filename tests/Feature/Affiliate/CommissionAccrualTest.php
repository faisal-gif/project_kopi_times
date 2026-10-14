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

class CommissionAccrualTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();
        Mail::fake();

        config(['services.tripay.private_key' => 'kunci-uji']);

        // 1 = paket pendaftaran (member baru), 2 = paket perpanjangan.
        DB::table('news_package')->insert([
            ['id' => 1, 'name' => 'Mulai Menulis', 'level' => 1, 'type' => '4', 'status' => 1, 'price' => 48000, 'period' => 1, 'jenis_periode' => 'bulan', 'quota' => 4],
            ['id' => 2, 'name' => 'Perpanjangan', 'level' => 2, 'type' => '4', 'status' => 1, 'price' => 48000, 'period' => 1, 'jenis_periode' => 'bulan', 'quota' => 4],
        ]);
    }

    private function member(): User
    {
        return User::factory()->create();
    }

    private function payment(User $user, int $packageId = 1, int $amount = 48000, string $status = 'pending'): Payments
    {
        return Payments::create([
            'user_id' => $user->id,
            'package_id' => $packageId,
            'merchant_ref' => 'SUB-' . uniqid(),
            'reference' => 'T' . uniqid(),
            'method' => 'QRIS',
            'amount' => $amount,
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
        ]);
    }

    /** Callback Tripay yang ditandatangani dengan benar. */
    private function sendCallback(Payments $payment): \Illuminate\Testing\TestResponse
    {
        $body = [
            'reference' => $payment->reference,
            'status' => 'PAID',
            'fee_merchant' => 0,
            'fee_customer' => 0,
            'total_fee' => 0,
            'total_amount' => $payment->amount,
            'amount_received' => $payment->amount,
        ];
        $json = json_encode($body);

        return $this->call(
            'POST',
            '/api/tripay/callback',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_X_CALLBACK_SIGNATURE' => hash_hmac('sha256', $json, 'kunci-uji')],
            $json,
        );
    }

    private function refer(User $user, Affiliate $affiliate): void
    {
        AffiliateReferral::create([
            'user_id' => $user->id,
            'affiliate_id' => $affiliate->id,
            'code' => $affiliate->code,
            'source' => 'link',
        ]);
    }

    public function test_new_member_with_upline_produces_three_rows(): void
    {
        $upline = Affiliate::factory()->create();
        $affiliate = Affiliate::factory()->create(['upline_id' => $upline->id]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $payment = $this->payment($user);
        $this->sendCallback($payment)->assertOk();

        $rows = AffiliateCommission::get()->keyBy('role');
        $this->assertCount(3, $rows);
        $this->assertSame(9600, (int) $rows['tier1']->amount);
        $this->assertSame(1920, (int) $rows['tier2']->amount);
        $this->assertSame(3840, (int) $rows['internal']->amount);
        $this->assertSame($affiliate->id, $rows['tier1']->affiliate_id);
        $this->assertSame($upline->id, $rows['tier2']->affiliate_id);
        $this->assertNull($rows['internal']->affiliate_id);

        // Net kantor adalah sisa, bukan baris.
        $this->assertSame(32640, (int) $payment->fresh()->amount - (int) AffiliateCommission::sum('amount'));
    }

    public function test_affiliate_without_upline_leaves_tier2_unassigned(): void
    {
        $affiliate = Affiliate::factory()->create(['upline_id' => null]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $tier2 = AffiliateCommission::where('role', 'tier2')->sole();
        $this->assertSame('unassigned', $tier2->status);
        $this->assertNull($tier2->affiliate_id);
        $this->assertSame($affiliate->id, $tier2->source_affiliate_id);
        $this->assertSame(1920, (int) $tier2->amount);
    }

    public function test_duplicate_callback_does_not_duplicate_commissions(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);
        $payment = $this->payment($user);

        $this->sendCallback($payment)->assertOk();
        $this->sendCallback($payment)->assertOk();

        $this->assertSame(3, AffiliateCommission::count());
        $this->assertSame(15360, (int) AffiliateCommission::sum('amount'));
    }

    public function test_renewal_package_earns_nothing(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user, packageId: 2))->assertOk();

        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_second_paid_payment_earns_nothing(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->payment($user, status: 'paid');                 // pembayaran lunas sebelumnya
        $this->sendCallback($this->payment($user))->assertOk();    // beli paket level 1 lagi

        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_affiliate_from_another_site_earns_nothing(): void
    {
        // Afiliator AJP (type 1), pembeli mengambil paket Kopi TIMES (type 4).
        $affiliate = Affiliate::factory()->create(['type' => 1]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_commission_rows_carry_the_site_type(): void
    {
        $affiliate = Affiliate::factory()->create(['type' => 4]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $this->assertSame(3, AffiliateCommission::where('type', 4)->count());
    }

    public function test_member_without_referral_earns_nothing(): void
    {
        $this->sendCallback($this->payment($this->member()))->assertOk();

        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_suspended_affiliate_earns_nothing(): void
    {
        $affiliate = Affiliate::factory()->suspended()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_available_at_is_seven_days_after_payment(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);
        $payment = $this->payment($user);

        $this->sendCallback($payment)->assertOk();

        $commission = AffiliateCommission::where('role', 'tier1')->sole();
        $this->assertSame(
            $payment->fresh()->paid_at->copy()->addDays(7)->toDateTimeString(),
            $commission->available_at->toDateTimeString(),
        );
    }

    public function test_split_uses_the_paid_amount_not_the_current_package_price(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);
        $payment = $this->payment($user, amount: 25000);        // invoice dibuat saat harga masih lama

        DB::table('news_package')->where('id', 1)->update(['price' => 48000]);

        $this->sendCallback($payment)->assertOk();

        $this->assertSame(5000, (int) AffiliateCommission::where('role', 'tier1')->value('amount'));
    }

    public function test_reverse_marks_commissions_as_reversed(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);
        $payment = $this->payment($user);
        $this->sendCallback($payment)->assertOk();

        $reversed = app(\App\Services\AffiliateCommissionService::class)
            ->reverse($payment->fresh(), 'Refund manual');

        $this->assertSame(3, $reversed);
        $this->assertSame(3, AffiliateCommission::where('status', 'reversed')->count());
        $this->assertSame('Refund manual', AffiliateCommission::first()->status_note);
    }
}

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
        $this->assertSame(4840, (int) $rows['internal']->amount);
        $this->assertSame($affiliate->id, $rows['tier1']->affiliate_id);
        $this->assertSame($upline->id, $rows['tier2']->affiliate_id);
        $this->assertNull($rows['internal']->affiliate_id);

        // Net kantor adalah sisa, bukan baris.
        $this->assertSame(31640, (int) $payment->fresh()->amount - (int) AffiliateCommission::sum('amount'));
    }

    /**
     * Tanpa upline, pos tier 2 TIDAK diterbitkan.
     *
     * Dulu barisnya tetap dibuat berstatus `unassigned` supaya uangnya terlihat.
     * Dibatalkan 2026-10-21: baris tanpa penerima lebih membingungkan daripada
     * membantu. 5%-nya kini tinggal di kantor tanpa jejak baris apa pun.
     */
    public function test_affiliate_without_upline_produces_no_tier2_row(): void
    {
        $affiliate = Affiliate::factory()->create(['upline_id' => null]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $payment = $this->payment($user);
        $this->sendCallback($payment)->assertOk();

        $this->assertSame(0, AffiliateCommission::where('role', 'tier2')->count());
        $this->assertSame(0, AffiliateCommission::where('status', 'unassigned')->count());

        // Perekrut tetap dapat 20%, staff IT tetap dapat bagiannya, sisanya ke kantor.
        $rows = AffiliateCommission::get()->keyBy('role');
        $this->assertCount(2, $rows);
        $this->assertSame(9600, (int) $rows['tier1']->amount);
        $this->assertSame(4840, (int) $rows['internal']->amount);
        $this->assertSame(33560, (int) $payment->fresh()->amount - (int) AffiliateCommission::sum('amount'));
    }

    public function test_duplicate_callback_does_not_duplicate_commissions(): void
    {
        $affiliate = Affiliate::factory()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);
        $payment = $this->payment($user);

        $this->sendCallback($payment)->assertOk();
        $this->sendCallback($payment)->assertOk();

        $this->assertSame(2, AffiliateCommission::count());   // tanpa upline: tier2 tidak terbit
        $this->assertSame(14440, (int) AffiliateCommission::sum('amount'));
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

    public function test_affiliate_from_another_site_earns_nothing_but_internal_still_accrues(): void
    {
        // Afiliator AJP (type 1), pembeli mengambil paket Kopi TIMES (type 4).
        $affiliate = Affiliate::factory()->create(['type' => 1]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $internal = AffiliateCommission::sole();
        $this->assertSame('internal', $internal->role);
        $this->assertSame(5800, (int) $internal->amount);
        $this->assertNull($internal->source_affiliate_id);
    }

    public function test_commission_rows_carry_the_site_type(): void
    {
        $affiliate = Affiliate::factory()->create(['type' => 4]);
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $this->assertSame(2, AffiliateCommission::where('type', 4)->count());
    }

    /** Tanpa kode referral tim IT tetap dapat bagiannya; kantor menyimpan sisanya. */
    public function test_member_without_referral_still_funds_the_internal_pot(): void
    {
        $payment = $this->payment($this->member());

        $this->sendCallback($payment)->assertOk();

        $internal = AffiliateCommission::sole();
        $this->assertSame('internal', $internal->role);
        $this->assertSame(5800, (int) $internal->amount);       // 10% dari 48.000 utuh + flat 1.000
        $this->assertSame(48000, (int) $internal->base_amount); // tidak ada potongan tier1
        $this->assertSame(1000, (int) $internal->rate_bps);
        $this->assertSame('accrued', $internal->status);
        $this->assertSame(4, (int) $internal->type);
        $this->assertNull($internal->affiliate_id);
        $this->assertNull($internal->source_affiliate_id);

        // Net kantor tetap sisa, bukan baris.
        $this->assertSame(42200, (int) $payment->fresh()->amount - 5800);
    }

    public function test_suspended_affiliate_earns_nothing_but_internal_still_accrues(): void
    {
        $affiliate = Affiliate::factory()->suspended()->create();
        $user = $this->member();
        $this->refer($user, $affiliate);

        $this->sendCallback($this->payment($user))->assertOk();

        $internal = AffiliateCommission::sole();
        $this->assertSame('internal', $internal->role);
        $this->assertSame(5800, (int) $internal->amount);
        $this->assertNull($internal->source_affiliate_id);
    }

    /** Perpanjangan tidak menghasilkan baris apa pun, pos internal sekalipun. */
    public function test_renewal_without_referral_earns_nothing_at_all(): void
    {
        $this->sendCallback($this->payment($this->member(), packageId: 2))->assertOk();

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

        $this->assertSame(2, $reversed);
        $this->assertSame(2, AffiliateCommission::where('status', 'reversed')->count());
        $this->assertSame('Refund manual', AffiliateCommission::first()->status_note);
    }
}

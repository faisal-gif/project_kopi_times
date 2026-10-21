<?php

namespace Tests\Feature;

use App\Models\AffiliateCommission;
use App\Models\Payments;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

/**
 * Halaman pembayaran sendiri: menyimpan alat bayar dari Tripay, merendernya, dan
 * mengaktifkan member saat cek status menemukan pembayarannya sudah masuk.
 */
class PaymentPageTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();
        Mail::fake();

        config([
            'services.tripay.private_key' => 'kunci-uji',
            'services.tripay.api_key' => 'api-uji',
            'services.tripay.merchant_code' => 'T0001',
            'services.tripay.base_url' => 'https://tripay.test/api',
        ]);

        DB::table('news_package')->insert([
            ['id' => 1, 'name' => 'Mulai Menulis', 'level' => 1, 'type' => '4', 'status' => 1,
             'price' => 48000, 'period' => 1, 'jenis_periode' => 'bulan', 'quota' => 4],
        ]);
    }

    /** Respons create Tripay untuk channel VA. */
    private function responsCreate(array $ganti = []): array
    {
        return ['success' => true, 'data' => array_merge([
            'reference' => 'DEV-T0001',
            'checkout_url' => 'https://tripay.test/checkout/DEV-T0001',
            'payment_name' => 'BRI Virtual Account',
            'pay_code' => '8808123456789012',
            'pay_url' => null,
            'qr_url' => null,
            'amount' => 48000,
            'fee_customer' => 4250,
            'total_fee' => 4250,
            'total_amount' => 52250,
            'expired_time' => now()->addHours(6)->timestamp,
            'instructions' => [
                ['title' => 'Mobile Banking BRI', 'steps' => ['Masuk aplikasi', 'Pilih <b>BRIVA</b>']],
            ],
        ], $ganti)];
    }

    private function buatPembayaran(User $user, array $ganti = []): Payments
    {
        Http::fake(['*/transaction/create' => Http::response($this->responsCreate($ganti))]);

        $this->actingAs($user)->post(route('checkout.payment'), [
            'package_id' => 1,
            'paymentMethod' => 'BRIVA',
        ]);

        return Payments::where('user_id', $user->id)->latest('id')->firstOrFail();
    }

    public function test_create_stores_the_payment_instrument_and_redirects_to_our_page(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);

        $this->assertSame('8808123456789012', $payment->pay_code);
        $this->assertSame('BRI Virtual Account', $payment->payment_name);
        $this->assertSame(52250, (int) $payment->total_amount);
        $this->assertSame(4250, (int) $payment->fee_customer);
        $this->assertIsArray($payment->instructions);

        // expired_at dari Tripay, bukan tebakan 24 jam lokal.
        $this->assertTrue($payment->expired_at->lessThan(now()->addHours(7)));
        $this->assertTrue($payment->expired_at->greaterThan(now()->addHours(5)));

        $this->actingAs($user)
            ->post(route('checkout.payment'), ['package_id' => 1, 'paymentMethod' => 'BRIVA'])
            ->assertRedirect(route('pembayaran.instruksi', $payment->merchant_ref));
    }

    public function test_instruction_page_sends_the_instrument_as_props(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);

        $this->actingAs($user)
            ->get(route('pembayaran.instruksi', $payment->merchant_ref))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Pembayaran/Instruksi')
                ->where('payment.pay_code', '8808123456789012')
                ->where('payment.total_amount', 52250)
                ->where('payment.status', 'pending')
            );
    }

    public function test_qris_payment_sends_the_image_url(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user, [
            'pay_code' => null,
            'qr_url' => 'https://tripay.test/qr/DEV-T0001.png',
            'payment_name' => 'QRIS',
        ]);

        $this->actingAs($user)
            ->get(route('pembayaran.instruksi', $payment->merchant_ref))
            ->assertInertia(fn ($page) => $page
                ->where('payment.qr_url', 'https://tripay.test/qr/DEV-T0001.png')
                ->where('payment.pay_code', null)
            );
    }

    public function test_another_user_cannot_open_someone_elses_payment(): void
    {
        $payment = $this->buatPembayaran(User::factory()->create(['status' => 0]));

        $this->actingAs(User::factory()->create(['status' => 0]))
            ->get(route('pembayaran.instruksi', $payment->merchant_ref))
            ->assertNotFound();
    }

    /** Inti fitur: Tripay bilang lunas, callback belum datang, member langsung aktif. */
    public function test_status_check_activates_the_member_when_tripay_says_paid(): void
    {
        $user = User::factory()->create(['status' => 0, 'quota_news' => 0]);
        $payment = $this->buatPembayaran($user);

        Http::fake(['*/transaction/detail*' => Http::response(['success' => true, 'data' => [
            'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 4250, 'total_fee' => 4250,
            'total_amount' => 52250, 'amount_received' => 48000,
        ]])]);

        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));

        $payment->refresh();
        $user->refresh();

        $this->assertSame('paid', $payment->status);
        $this->assertNotNull($payment->paid_at);
        $this->assertSame(1, (int) $user->status);
        $this->assertSame(4, (int) $user->quota_news);
        $this->assertSame(1, AffiliateCommission::count());   // pos internal staff IT
    }

    public function test_second_status_check_does_not_double_anything(): void
    {
        $user = User::factory()->create(['status' => 0, 'quota_news' => 0]);
        $payment = $this->buatPembayaran($user);

        Http::fake(['*/transaction/detail*' => Http::response(['success' => true, 'data' => [
            'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 4250, 'total_fee' => 4250,
            'total_amount' => 52250, 'amount_received' => 48000,
        ]])]);

        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));
        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));

        $this->assertSame(4, (int) $user->refresh()->quota_news);
        $this->assertSame(1, AffiliateCommission::count());
        $this->assertSame(1, Payments::where('status', 'paid')->count());
    }

    /** Callback yang menyusul sesudah cek status harus jadi no-op. */
    public function test_callback_after_status_check_changes_nothing(): void
    {
        $user = User::factory()->create(['status' => 0, 'quota_news' => 0]);
        $payment = $this->buatPembayaran($user);

        Http::fake(['*/transaction/detail*' => Http::response(['success' => true, 'data' => [
            'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 4250, 'total_fee' => 4250,
            'total_amount' => 52250, 'amount_received' => 48000,
        ]])]);

        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));

        $body = json_encode([
            'reference' => $payment->reference, 'status' => 'PAID',
            'fee_merchant' => 0, 'fee_customer' => 4250, 'total_fee' => 4250,
            'total_amount' => 52250, 'amount_received' => 48000,
        ]);

        $this->call('POST', '/api/tripay/callback', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_CALLBACK_SIGNATURE' => hash_hmac('sha256', $body, 'kunci-uji'),
        ], $body)->assertOk();

        $this->assertSame(4, (int) $user->refresh()->quota_news);
        $this->assertSame(1, AffiliateCommission::count());
    }

    public function test_status_check_changes_nothing_when_still_unpaid(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);

        Http::fake(['*/transaction/detail*' => Http::response(['success' => true, 'data' => ['status' => 'UNPAID']])]);

        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));

        $this->assertSame('pending', $payment->refresh()->status);
        $this->assertSame(0, (int) $user->refresh()->status);
        $this->assertSame(0, AffiliateCommission::count());
    }

    /** Tripay tidak bisa dihubungi berarti "belum tahu", bukan "belum dibayar". */
    public function test_unreachable_tripay_does_not_change_the_status(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);

        Http::fake(['*/transaction/detail*' => Http::response([], 500)]);

        $this->actingAs($user)->post(route('pembayaran.cek', $payment->merchant_ref));

        $this->assertSame('pending', $payment->refresh()->status);
    }

    public function test_opening_an_overdue_payment_marks_it_expired(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);
        $payment->update(['expired_at' => now()->subMinute()]);

        $this->actingAs($user)
            ->get(route('pembayaran.instruksi', $payment->merchant_ref))
            ->assertInertia(fn ($page) => $page->where('payment.status', 'expired'));

        $this->assertSame('expired', $payment->refresh()->status);
    }

    public function test_recreate_makes_a_new_pending_payment_with_the_same_method(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $lama = $this->buatPembayaran($user);
        $lama->update(['expired_at' => now()->subMinute(), 'status' => 'expired']);

        Http::fake(['*/transaction/create' => Http::response($this->responsCreate(['reference' => 'DEV-T0002']))]);

        $this->actingAs($user)->post(route('pembayaran.ulang', $lama->merchant_ref));

        $baru = Payments::where('user_id', $user->id)->where('status', 'pending')->sole();
        $this->assertSame('BRIVA', $baru->method);
        $this->assertNotSame($lama->merchant_ref, $baru->merchant_ref);
    }

    public function test_recreate_is_refused_while_the_payment_is_still_valid(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);

        $this->actingAs($user)
            ->post(route('pembayaran.ulang', $payment->merchant_ref))
            ->assertRedirect(route('pembayaran.instruksi', $payment->merchant_ref));

        $this->assertSame(1, Payments::count());
    }

    /** Baris lama tanpa alat bayar tetap punya jalan keluar ke halaman Tripay. */
    public function test_old_row_without_instrument_falls_back_to_the_hosted_page(): void
    {
        $user = User::factory()->create(['status' => 0]);
        $payment = $this->buatPembayaran($user);
        $payment->update(['pay_code' => null, 'pay_url' => null, 'qr_url' => null]);

        $this->actingAs($user)
            ->get(route('pembayaran.instruksi', $payment->merchant_ref))
            ->assertInertia(fn ($page) => $page
                ->where('payment.pay_code', null)
                ->where('payment.checkout_url', 'https://tripay.test/checkout/DEV-T0001')
            );
    }

    /** Tripay bisa menjawab sukses dengan data tidak lengkap; jangan sampai 500. */
    public function test_incomplete_tripay_response_fails_gracefully(): void
    {
        $user = User::factory()->create(['status' => 0]);

        Http::fake(['*/transaction/create' => Http::response(['success' => true, 'data' => []])]);

        $this->actingAs($user)
            ->post(route('checkout.payment'), ['package_id' => 1, 'paymentMethod' => 'BRIVA'])
            ->assertRedirect();

        // Tanpa reference, callback tidak akan pernah bisa dicocokkan: lebih baik
        // tidak ada baris sama sekali daripada pembayaran yatim.
        $this->assertSame(0, Payments::count());
    }
}

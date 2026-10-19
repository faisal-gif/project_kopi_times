<?php

namespace Tests\Feature\Affiliate;

use App\Models\Affiliate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

class AffiliateApplicationTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Bu Dosen',
            'email' => 'dosen@kampus.ac.id',
            'phone' => '81234567890',
            'payout_method' => 'bank',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Bu Dosen',
            'applicant_note' => 'Mahasiswa di kampus tempat saya mengajar.',
            'terms' => true,
        ], $overrides);
    }

    public function test_active_member_sees_the_form(): void
    {
        $this->actingAs(User::factory()->active()->create())
            ->get('/afiliasi/daftar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Afiliasi/Daftar')->where('min_payout', 50000));
    }

    public function test_inactive_member_is_sent_to_checkout(): void
    {
        $this->actingAs(User::factory()->create(['status' => 0]))
            ->get('/afiliasi/daftar')
            ->assertRedirect(route('checkout'));
    }

    public function test_valid_application_creates_a_pending_row(): void
    {
        $user = User::factory()->active()->create();

        $this->actingAs($user)
            ->post('/afiliasi/daftar', $this->payload())
            ->assertRedirect(route('afiliasi.index'));

        $affiliate = Affiliate::sole();
        $this->assertSame($user->id, $affiliate->user_id);
        $this->assertSame('pending', $affiliate->status);
        $this->assertNull($affiliate->upline_id);          // tanpa perekrut: ditetapkan admin
        $this->assertNotNull($affiliate->terms_accepted_at);
        $this->assertSame('Mahasiswa di kampus tempat saya mengajar.', $affiliate->applicant_note);
        $this->assertSame('BCA', $affiliate->bank_name);
        $this->assertSame(4, (int) $affiliate->type);      // situs tempat ia mendaftar
    }

    /** Perekrut member otomatis jadi upline — inilah yang membentuk tingkat kedua. */
    public function test_recruiter_becomes_the_upline_automatically(): void
    {
        $perekrut = Affiliate::factory()->create(['type' => 4]);
        $user = User::factory()->active()->create();
        $this->refer($user, $perekrut);

        $this->actingAs($user)->post('/afiliasi/daftar', $this->payload());

        $this->assertSame($perekrut->id, Affiliate::where('user_id', $user->id)->value('upline_id'));
    }

    public function test_suspended_recruiter_does_not_become_upline(): void
    {
        $perekrut = Affiliate::factory()->suspended()->create(['type' => 4]);
        $user = User::factory()->active()->create();
        $this->refer($user, $perekrut);

        $this->actingAs($user)->post('/afiliasi/daftar', $this->payload());

        $this->assertNull(Affiliate::where('user_id', $user->id)->value('upline_id'));
    }

    /** Komisi tingkat 2 tidak boleh melintasi situs, jadi uplinenya pun tidak boleh. */
    public function test_recruiter_from_another_site_does_not_become_upline(): void
    {
        $perekrut = Affiliate::factory()->create(['type' => 1]);   // afiliator AJP
        $user = User::factory()->active()->create();
        $this->refer($user, $perekrut);

        $this->actingAs($user)->post('/afiliasi/daftar', $this->payload());

        $this->assertNull(Affiliate::where('user_id', $user->id)->value('upline_id'));
    }

    /** Perekrut yang masih menunggu persetujuan belum boleh memperoleh tingkat kedua. */
    public function test_pending_recruiter_does_not_become_upline(): void
    {
        $perekrut = Affiliate::factory()->create(['type' => 4, 'status' => 'pending']);
        $user = User::factory()->active()->create();
        $this->refer($user, $perekrut);

        $this->actingAs($user)->post('/afiliasi/daftar', $this->payload());

        $this->assertNull(Affiliate::where('user_id', $user->id)->value('upline_id'));
    }

    private function refer(User $user, Affiliate $affiliate): void
    {
        \App\Models\AffiliateReferral::create([
            'type' => $affiliate->type,
            'user_id' => $user->id,
            'affiliate_id' => $affiliate->id,
            'code' => $affiliate->code,
            'source' => 'link',
        ]);
    }

    public function test_application_on_another_deployment_is_tagged_with_that_site(): void
    {
        config(['affiliate.site_type' => 1]);               // deployment AJP

        $this->actingAs(User::factory()->active()->create())
            ->post('/afiliasi/daftar', $this->payload());

        $this->assertSame(1, (int) Affiliate::sole()->type);
    }

    public function test_generated_code_is_unique_and_well_formed(): void
    {
        Affiliate::factory()->create(['code' => 'BUDOSEABCD']);

        $this->actingAs(User::factory()->active()->create())
            ->post('/afiliasi/daftar', $this->payload());

        $code = Affiliate::where('status', 'pending')->value('code');
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{3,32}$/', $code);
        $this->assertSame(1, Affiliate::where('code', $code)->count());
    }

    public function test_terms_must_be_accepted(): void
    {
        $this->actingAs(User::factory()->active()->create())
            ->post('/afiliasi/daftar', $this->payload(['terms' => false]))
            ->assertSessionHasErrors('terms');

        $this->assertSame(0, Affiliate::count());
    }

    public function test_bank_details_are_required(): void
    {
        $this->actingAs(User::factory()->active()->create())
            ->post('/afiliasi/daftar', $this->payload(['bank_account_number' => '', 'bank_name' => '']))
            ->assertSessionHasErrors(['bank_name', 'bank_account_number']);

        $this->assertSame(0, Affiliate::count());
    }

    public function test_cannot_apply_twice(): void
    {
        $user = User::factory()->active()->create();
        Affiliate::factory()->pending()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/afiliasi/daftar')->assertRedirect(route('afiliasi.index'));
        $this->actingAs($user)->post('/afiliasi/daftar', $this->payload())->assertForbidden();

        $this->assertSame(1, Affiliate::count());
    }

    public function test_pending_applicant_sees_status_not_numbers(): void
    {
        $user = User::factory()->active()->create();
        Affiliate::factory()->pending()->create(['user_id' => $user->id, 'name' => 'Bu Dosen']);

        $this->actingAs($user)->get('/afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Afiliasi/Index')
                ->where('affiliate.status', 'pending')
                ->where('affiliate.name', 'Bu Dosen')
                ->missing('summary')
                ->missing('commissions')
            );
    }

    public function test_member_without_application_is_sent_to_the_form(): void
    {
        $this->actingAs(User::factory()->active()->create())
            ->get('/afiliasi')
            ->assertRedirect(route('afiliasi.daftar'));
    }

    public function test_terms_page_shows_commission_rates_but_never_the_internal_one(): void
    {
        // Halaman Inertia dirender di browser, jadi yang diperiksa adalah props-nya.
        $this->get('/syarat-afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Afiliasi/SyaratKetentuan')
                ->where('tier1_bps', 2000)
                ->where('tier2_bps', 500)
                ->missing('internal_bps')      // pos internal tidak pernah dikirim ke publik
            );
    }
}

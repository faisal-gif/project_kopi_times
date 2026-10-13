<?php

namespace Tests\Feature\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

class AffiliatePortalTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();
    }

    private function commissionFor(Affiliate $affiliate, User $member, string $role, int $amount, string $status = 'accrued'): void
    {
        DB::table('payments')->insertOrIgnore([
            'id' => 1, 'user_id' => $member->id, 'package_id' => 1, 'merchant_ref' => 'SUB-1',
            'amount' => 48000, 'status' => 'paid', 'created_at' => now(), 'updated_at' => now(),
        ]);

        AffiliateCommission::create([
            'payment_id' => 1,
            'user_id' => $member->id,
            'role' => $role,
            'affiliate_id' => $role === 'internal' ? null : $affiliate->id,
            'source_affiliate_id' => $affiliate->id,
            'base_amount' => $role === 'tier1' ? 48000 : 38400,
            'rate_bps' => $role === 'tier1' ? 2000 : ($role === 'tier2' ? 500 : 1000),
            'amount' => $amount,
            'status' => $status,
            'available_at' => now()->addDays(7),
        ]);
    }

    public function test_non_affiliate_is_sent_to_the_application_form(): void
    {
        $this->actingAs(User::factory()->active()->create())
            ->get('/afiliasi')
            ->assertRedirect(route('afiliasi.daftar'));
    }

    public function test_suspended_affiliate_still_sees_own_history_with_a_warning(): void
    {
        $user = User::factory()->create();
        Affiliate::factory()->suspended()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('affiliate.status', 'suspended'));
    }

    public function test_inactive_member_who_is_an_affiliate_can_open_the_page(): void
    {
        $user = User::factory()->create(['status' => 0]);   // bukan member berbayar
        Affiliate::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/afiliasi')->assertOk();
    }

    public function test_page_shows_own_commissions_and_summary(): void
    {
        $user = User::factory()->create();
        $affiliate = Affiliate::factory()->create(['user_id' => $user->id, 'code' => 'DOSEN01']);
        $member = User::factory()->create(['nama' => 'Calon Penulis']);

        $this->commissionFor($affiliate, $member, 'tier1', 9600);

        $this->actingAs($user)->get('/afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Afiliasi/Index')
                ->where('affiliate.code', 'DOSEN01')
                ->where('summary.held', 9600)
                ->where('commissions.data.0.member', 'Calon Penulis')
                ->where('commissions.data.0.amount', 9600)
            );
    }

    public function test_internal_position_never_reaches_the_page(): void
    {
        $user = User::factory()->create();
        $affiliate = Affiliate::factory()->create(['user_id' => $user->id]);
        $member = User::factory()->create();

        $this->commissionFor($affiliate, $member, 'internal', 3840);

        $this->actingAs($user)->get('/afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('commissions.data', [])
                ->where('summary.held', 0)
            );

        $this->assertStringNotContainsString('rate_bps', $this->get('/afiliasi')->getContent());
    }

    public function test_another_affiliates_commission_is_not_visible(): void
    {
        $user = User::factory()->create();
        $mine = Affiliate::factory()->create(['user_id' => $user->id]);
        $someoneElse = Affiliate::factory()->create();
        $member = User::factory()->create();

        $this->commissionFor($someoneElse, $member, 'tier1', 9600);

        $this->actingAs($user)->get('/afiliasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('commissions.data', [])->where('summary.payable', 0));

        $this->assertSame(0, AffiliateCommission::ownedBy($mine->id)->count());
    }
}

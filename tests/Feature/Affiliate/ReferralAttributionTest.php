<?php

namespace Tests\Feature\Affiliate;

use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

class ReferralAttributionTest extends TestCase
{
    use RefreshDatabase, CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createLegacySchema();

        DB::table('news_package')->insert([
            'id' => 1, 'name' => 'Mulai Menulis', 'level' => 1, 'type' => '4', 'status' => 1,
            'price' => 48000, 'period' => 1, 'jenis_periode' => 'bulan', 'quota' => 4,
        ]);
        DB::table('kategori_kt')->insert(['id' => 1, 'kategori_id' => 9, 'name' => 'Dosen']);
    }

    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Calon Penulis',
            'email' => 'calon@example.com',
            'prov' => 'Jawa Timur',
            'city' => 'Kota Malang',
            'address' => 'Jl. Besar Ijen No. 90',
            'contact' => '81234567890',
            'profesi' => 9,
            'plan_id' => 1,
            'password' => 'Rahasia#2026',
            'password_confirmation' => 'Rahasia#2026',
        ], $overrides);
    }

    public function test_ref_query_is_stored_in_a_cookie(): void
    {
        $this->get('/?ref=DOSEN01')->assertPlainCookie(config('affiliate.cookie_name'), 'DOSEN01');
    }

    public function test_cookie_domain_can_span_subdomains(): void
    {
        config(['affiliate.cookie_domain' => '.times.co.id']);

        $cookie = collect($this->get('/?ref=DOSEN01')->headers->getCookies())
            ->first(fn ($c) => $c->getName() === config('affiliate.cookie_name'));

        $this->assertNotNull($cookie);
        $this->assertSame('.times.co.id', $cookie->getDomain());
    }

    /** Sentuhan terakhir yang menang: link terbaru menimpa kode yang sudah tersimpan. */
    public function test_newest_ref_overwrites_the_existing_cookie(): void
    {
        $this->withUnencryptedCookie(config('affiliate.cookie_name'), 'PERTAMA')
            ->get('/?ref=KEDUA')
            ->assertPlainCookie(config('affiliate.cookie_name'), 'KEDUA');
    }


    /**
     * Pendaftar boleh melepas ajakan yang terdeteksi.
     *
     * Form mengirim ref kosong; cookie yang masih ada sengaja diabaikan, kalau tidak
     * tombol "Daftar tanpa kode ini" tidak akan ada artinya.
     */
    public function test_empty_ref_field_detaches_the_cookie_referral(): void
    {
        Affiliate::factory()->create(['code' => 'DOSEN01']);

        $this->withUnencryptedCookie(config('affiliate.cookie_name'), 'DOSEN01')
            ->post('/register', $this->registrationPayload(['ref' => '']))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertSame(1, User::count());
        $this->assertSame(0, AffiliateReferral::count());
    }

    /** Tanpa pelepasan, ref dari form tetap mencatat seperti biasa. */
    public function test_ref_field_from_the_form_records_the_referral(): void
    {
        $affiliate = Affiliate::factory()->create(['code' => 'DOSEN01']);

        $this->post('/register', $this->registrationPayload(['ref' => 'DOSEN01']));

        $this->assertSame($affiliate->id, AffiliateReferral::sole()->affiliate_id);
    }
    public function test_registration_with_cookie_records_the_referral(): void
    {
        $affiliate = Affiliate::factory()->create(['code' => 'DOSEN01']);

        $this->withUnencryptedCookie(config('affiliate.cookie_name'), 'DOSEN01')
            ->post('/register', $this->registrationPayload())
            ->assertRedirect(route('dashboard', absolute: false));

        $referral = AffiliateReferral::sole();
        $this->assertSame($affiliate->id, $referral->affiliate_id);
        $this->assertSame('DOSEN01', $referral->code);
        $this->assertSame('link', $referral->source);
        $this->assertSame(4, (int) $referral->type);        // situs tempat pendaftaran terjadi
        $this->assertSame(User::sole()->id, $referral->user_id);
    }

    public function test_manually_typed_code_wins_over_the_cookie(): void
    {
        Affiliate::factory()->create(['code' => 'DARILINK']);
        $typed = Affiliate::factory()->create(['code' => 'DIKETIK1']);

        $this->withUnencryptedCookie(config('affiliate.cookie_name'), 'DARILINK')
            ->post('/register', $this->registrationPayload(['referral_code' => 'diketik1']));

        $referral = AffiliateReferral::sole();
        $this->assertSame($typed->id, $referral->affiliate_id);
        $this->assertSame('manual', $referral->source);
    }

    public function test_unknown_code_does_not_block_registration(): void
    {
        $this->post('/register', $this->registrationPayload(['referral_code' => 'NGAWUR']))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
        $this->assertSame(0, AffiliateReferral::count());
    }

    public function test_suspended_affiliate_earns_no_referral(): void
    {
        Affiliate::factory()->suspended()->create(['code' => 'SUSPEND1']);

        $this->withUnencryptedCookie(config('affiliate.cookie_name'), 'SUSPEND1')
            ->post('/register', $this->registrationPayload())
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertSame(1, User::count());
        $this->assertSame(0, AffiliateReferral::count());
    }

    public function test_self_referral_is_rejected(): void
    {
        Affiliate::factory()->create(['code' => 'SENDIRI1', 'email' => 'calon@example.com']);

        $this->post('/register', $this->registrationPayload(['referral_code' => 'SENDIRI1']));

        $this->assertSame(1, User::count());
        $this->assertSame(0, AffiliateReferral::count());
    }

    public function test_register_page_shows_who_invited(): void
    {
        Affiliate::factory()->create(['code' => 'DOSEN01', 'name' => 'Bu Dosen']);

        $this->get('/register?ref=DOSEN01')
            ->assertOk()
            ->assertSee('Bu Dosen', false);
    }
}

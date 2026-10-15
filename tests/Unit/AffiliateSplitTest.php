<?php

namespace Tests\Unit;

use App\Services\AffiliateCommissionService;
use Tests\TestCase;

class AffiliateSplitTest extends TestCase
{
    public function test_split_of_48000_matches_the_agreed_figures(): void
    {
        $rows = collect(AffiliateCommissionService::split(48_000))->keyBy('role');

        $this->assertSame(9_600, $rows['tier1']['amount']);
        $this->assertSame(1_920, $rows['tier2']['amount']);
        $this->assertSame(3_840, $rows['internal']['amount']);

        $this->assertSame(48_000, $rows['tier1']['base_amount']);
        $this->assertSame(38_400, $rows['tier2']['base_amount']);
        $this->assertSame(38_400, $rows['internal']['base_amount']);
    }

    public function test_office_keeps_the_remainder(): void
    {
        $total = collect(AffiliateCommissionService::split(48_000))->sum('amount');

        $this->assertSame(15_360, $total);
        $this->assertSame(32_640, 48_000 - $total);
    }

    public function test_odd_price_floors_every_position_and_never_overspends(): void
    {
        $rows = AffiliateCommissionService::split(47_777);

        foreach ($rows as $row) {
            $this->assertIsInt($row['amount']);
        }

        $this->assertSame(9_555, $rows[0]['amount']);        // floor(47777 * 20%)
        $this->assertLessThan(47_777, array_sum(array_column($rows, 'amount')));
    }

    public function test_without_a_recruiter_only_the_internal_position_remains(): void
    {
        $rows = AffiliateCommissionService::split(48_000, adaPerekrut: false);

        $this->assertCount(1, $rows);
        $this->assertSame('internal', $rows[0]['role']);
        $this->assertSame(48_000, $rows[0]['base_amount']);   // tidak ada potongan tier1
        $this->assertSame(4_800, $rows[0]['amount']);
        $this->assertSame(43_200, 48_000 - $rows[0]['amount']);
    }

    public function test_rates_come_from_config(): void
    {
        config(['affiliate.tier1_bps' => 1000]);

        $rows = collect(AffiliateCommissionService::split(48_000))->keyBy('role');

        $this->assertSame(4_800, $rows['tier1']['amount']);
        $this->assertSame(43_200, $rows['tier2']['base_amount']);
    }
}

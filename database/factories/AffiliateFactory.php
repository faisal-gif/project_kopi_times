<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Affiliate>
 */
class AffiliateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'status' => 'active',
            'approved_at' => now(),
        ];
    }

    public function suspended(): static
    {
        return $this->state(fn () => ['status' => 'suspended']);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending', 'approved_at' => null]);
    }
}

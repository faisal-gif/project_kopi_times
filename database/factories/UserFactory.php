<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Tabel `wartawan`, bukan `users`: kolomnya `nama`, `status`, `package_id`, dst.
 *
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'nama' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'prov' => fake()->state(),
            'city' => fake()->city(),
            'contact' => fake()->numerify('8##########'),
            'address' => fake()->address(),
            'type' => 4,
            'status' => 0,
        ];
    }

    /** Member aktif berbayar. */
    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 1,
            'dateexp' => now()->addMonth(),
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}

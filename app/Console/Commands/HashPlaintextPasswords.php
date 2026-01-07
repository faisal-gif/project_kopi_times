<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class HashPlaintextPasswords extends Command
{
    protected $signature = 'users:migrate-password';
    protected $description = 'Migrasi password plaintext dari kolom pswd ke password bcrypt Laravel';

    public function handle()
    {
        $users = User::whereNotNull('passwd')
            ->where(function ($q) {
                $q->whereNull('password')
                  ->orWhere('password', '');
            })
            ->get();

        $count = 0;

        foreach ($users as $user) {

            // Validasi ekstra
            if (!$user->passwd) {
                continue;
            }

            $user->password = Hash::make($user->passwd);

            $user->save();
            $count++;
        }

        $this->info("Migrasi selesai. {$count} user berhasil di-update.");
    }
}

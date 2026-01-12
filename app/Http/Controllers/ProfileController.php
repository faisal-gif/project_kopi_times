<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:png|max:2048',
            'avatar_raw' => 'required|image|max:5120',
        ]);
        $user = auth()->user();

        DB::transaction(function () use ($request, $user) {

            /** =========================
             * HAPUS FILE LAMA (JIKA ADA)
             * ========================= */
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            if ($user->avatar_raw && Storage::disk('public')->exists($user->avatar_raw)) {
                Storage::disk('public')->delete($user->avatar_raw);
            }

            /** =========================
             * SIMPAN FILE BARU
             * ========================= */
            $rawPath = $this->storeAvatarRaw($request->file('avatar_raw'));
            $avatarPath = $this->storeAvatar($request->file('avatar'));

            /** =========================
             * UPDATE USER
             * ========================= */
            $user->update([
                'avatar' => $avatarPath,
                'avatar_raw' => $rawPath,
            ]);
            DB::afterCommit(function () use ($user) {
                if ($user->member_card && Storage::disk('public')->exists($user->member_card)) {
                    Storage::disk('public')->delete($user->member_card);
                }

                $memberCardPath = $this->generateCard($user);
                $user->member_card = $memberCardPath;
                $user->save();
            });
        });

        return redirect()->route('dashboard');
    }

    private function storeAvatar($image)
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->read($image);
        $encode = $image->toPng();
        $path = 'images/avatar/' . time() . '.png';
        Storage::disk('public')->put($path, $encode);
        return $path;
    }

    private function storeAvatarRaw($image)
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->read($image);
        $encode = $image->toPng();
        $path = 'images/avatar/raw/' . time() . '_raw' . '.png';
        Storage::disk('public')->put($path, $encode);
        return $path;
    }

    public function generateCard($user)
    {
        // Buat instance manager dengan driver GD
        $manager = new ImageManager(new Driver());

        Carbon::setLocale('id');

        $expiredDate = Carbon::parse($user->dateexp)->translatedFormat('d F Y');

        // 1. Baca Template Background
        $image = $manager->read(public_path('templates/card_bg.jpeg'));

        $width = $image->width();
        $centerX = $width / 2; // Ini adalah titik tengah absolut

        // 2. Tambahkan Foto Profil
        // Kita buat foto jadi bulat/frame sesuai contoh
        $profile = $manager->read(public_path('storage/' . $user->avatar));
        $profile->cover(400, 400); // Resize dan crop otomatis
        $image->place($profile, 'top', 0, 500);


        // Teks Nama (Tengah)
        $image->text($user->nama, $centerX, 1150, function ($font) {
            $font->filename(public_path('fonts/Montserrat-SemiBold.ttf'));
            $font->size(60);
            $font->color('a80000'); // Merah gelap
            $font->align('center');
        });

        // Teks Nomor ID
        $image->text('NOMOR ID: KT-' . time() . $user->id, $centerX, 1200, function ($font) {
            $font->filename(public_path('fonts/Montserrat-Regular.ttf'));
            $font->size(30);
            $font->color('000000');
            $font->align('center');
        });

        // Teks Nomor ID
        $image->text('BERLAKU SAMPAI: ' . $expiredDate, $centerX, 1250, function ($font) {
            $font->filename(public_path('fonts/Montserrat-Regular.ttf'));
            $font->size(30);
            $font->color('000000');
            $font->align('center');
        });


        // 5. Simpan atau Encode
        $encoded = $image->toJpeg(90);
        $path = 'images/member_card/' . time() . '.jpeg';
        Storage::disk('public')->put($path, $encoded);
        return $path;
    }



    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

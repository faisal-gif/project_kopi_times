<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\NewsPackage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;


class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Ambil data paket langganan user untuk ID Card
        $paket_terdaftar = NewsPackage::find($user->package_id);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => session('status'),
            'paket_terdaftar' => $paket_terdaftar, // Kirim ke frontend
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

            // HAPUS member_card lama (karena kita tidak pakai ini lagi di DB)
            if ($user->member_card && Storage::disk('public')->exists($user->member_card)) {
                Storage::disk('public')->delete($user->member_card);
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
                'member_card' => null, // Dikosongkan karena di-generate via Frontend
            ]);
        });

        return back()->with('success', 'Avatar berhasil diperbarui!');
    }

    // Biarkan fungsi storeAvatar() dan storeAvatarRaw() tetap seperti biasa

    private function storeAvatar($image)
    {
        $ext = $image->getClientOriginalExtension() ?: 'png';
        $path = 'images/avatar/' . time() . '.' . $ext;
        Storage::disk('public')->putFileAs('images/avatar', $image, time() . '.' . $ext);
        return $path;
    }

    private function storeAvatarRaw($image)
    {
        $ext = $image->getClientOriginalExtension() ?: 'png';
        $name = time() . '_raw.' . $ext;
        Storage::disk('public')->putFileAs('images/avatar/raw', $image, $name);
        return 'images/avatar/raw/' . $name;
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\ImagesThumbnail;
use App\Models\NewsPackage;
use App\Services\CdnService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;


class ProfileController extends Controller
{
    public function __construct(private CdnService $cdnService) {}
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('paket');
        $thumbnail = ImagesThumbnail::where('user_id', $user->id)->latest()->first();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'thumbnail' => $thumbnail?->image_path,
            // 'paket_terdaftar' => ...,   // biarkan yang sudah ada
            'news_package' => [
                'name'           => $user->paket?->name,   // sesuaikan kolom nama di NewsPackage
                'dateexp'        => $user->dateexp,
                'quota_news'     => $user->quota_news,
                'feed_instagram' => $user->feed_instagram,
                'ekoran'         => $user->ekoran,
                'wa_channel'     => $user->wa_channel,
            ],
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

    public function updateThumbnail(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // maks 5MB
        ]);

        $user = $request->user();

        try {
            $file = $request->file('image');
            $name = 'kopi-times-' . Str::slug(Str::limit($user->nama, 100, '')) . '-thumbnail-1';

            $thumbnailUrl = $this->cdnService->uploadImage($file, $name, 3, 'raw', 0);

            if (! $thumbnailUrl) {
                return back()->withErrors(['image' => 'Gagal mengunggah gambar ke CDN.']);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['image' => 'Gagal mengunggah gambar: ' . $e->getMessage()]);
        }

        // Update jika sudah ada, buat baru jika belum — mengikuti pola latest()->first()
        $existing = ImagesThumbnail::where('user_id', $user->id)->latest()->first();
        if ($existing) {
            $existing->update(['template_id' => 1, 'image_path' => $thumbnailUrl]);
        } else {
            ImagesThumbnail::create([
                'user_id' => $user->id,
                'template_id' => 1,
                'image_path' => $thumbnailUrl,
            ]);
        }

        return back()->with('success', 'Foto thumbnail berhasil diperbarui.');
    }
}

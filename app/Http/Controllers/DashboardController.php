<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class DashboardController extends Controller
{
    public function index()
    {
        $auth = Auth::user();

        $total_news = News::where('pewarta_id', $auth->id)->count();
        $total_pending_news = News::where('pewarta_id', $auth->id)->where('status', 0)->count();
        $total_publish_news = News::where('pewarta_id', $auth->id)->where('status', 1)->count();
        $paket_terdaftar = NewsPackage::find($auth->package_id);

        return Inertia::render('Dashboard', [
            'total_news' => $total_news,
            'auth_user' => $auth,
            'paket_terdaftar' => $paket_terdaftar,
            'pending_news' => $total_pending_news,
            'publish_news' => $total_publish_news,
        ]);
    }

    public function generateCard()
    {
        // Buat instance manager dengan driver GD
        $manager = new ImageManager(new Driver());

        // 1. Baca Template Background
        $image = $manager->read(public_path('templates/card_bg.jpeg'));

        $width = $image->width();
        $centerX = $width / 2; // Ini adalah titik tengah absolut

        // 2. Tambahkan Foto Profil
        // Kita buat foto jadi bulat/frame sesuai contoh
        $profile = $manager->read(public_path('storage/images/avatar/1768209781.png'));
        $profile->cover(400, 400); // Resize dan crop otomatis
        $image->place($profile, 'top', 0, 500);

        // Teks Tingkat (Kanan Atas)
        $image->text('LEVEL 1', $width - 20, 80, function ($font) {
            $font->filename(public_path('fonts/Montserrat-Bold.ttf'));
            $font->size(40);
            $font->color('ffffff');
            $font->align('right');
        });

        // Teks Nama (Tengah)
        $image->text('HAINOR RAHMAN', $centerX, 1150, function ($font) {
            $font->filename(public_path('fonts/Montserrat-SemiBold.ttf'));
            $font->size(60);
            $font->color('a80000'); // Merah gelap
            $font->align('center');
        });

        // Teks Nomor ID
        $image->text('NOMOR ID: 1234', $centerX, 1200, function ($font) {
            $font->filename(public_path('fonts/Montserrat-Regular.ttf'));
            $font->size(30);
            $font->color('000000');
            $font->align('center');
        });

         // Teks Nomor ID
        $image->text('BERLAKU SAMPAI: 20-09-2028', $centerX, 1250, function ($font) {
            $font->filename(public_path('fonts/Montserrat-Regular.ttf'));
            $font->size(30);
            $font->color('000000');
            $font->align('center');
        });


        // 5. Simpan atau Encode
        $encoded = $image->toJpeg(90);
        return response($encoded)->header('Content-Type', 'image/jpeg');
    }
}

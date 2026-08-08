<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MerchandiseShipmentController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PendingController;
use App\Http\Controllers\PublicNewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::get('/tentang', function () {
    return Inertia::render('Tentang/Index', [
        'og' => [
            'title'       => 'Tentang — Kopi TIMES',
            'description' => 'Mengenal Kopi TIMES — program keanggotaan penulis TIMES Indonesia untuk ekosistem gagasan dan jurnalisme positif.',
            'image'       => url('/bg_kopi_times.png'),
            'url'         => route('tentang'),
        ],
    ]);
})->name('tentang');
Route::get('/harga', [WelcomeController::class, 'harga'])->name('harga');
Route::get('/kebijakan-privasi', function () {
    return Inertia::render('KebijakanPrivasi/Index');
})->name('kebijakan-privasi');
Route::get('/syarat-ketentuan', function () {
    return Inertia::render('SyaratKetentuan/Index');
})->name('syarat-ketentuan');




// Kirim berita publik tanpa login — tiap event punya URL sendiri via slug
Route::get('/kirim-berita/{event:slug}', [PublicNewsController::class, 'create'])->name('public-news.create');
Route::post('/kirim-berita/{event:slug}', [PublicNewsController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('public-news.store');


Route::get('/checkout', [PendingController::class, 'index'])->middleware('auth')->name('checkout');
Route::post('/checkout/payment', [PaymentController::class, 'store'])->middleware('auth')->name('checkout.payment');


Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('news', NewsController::class);
    Route::post('/news/{news}/request-addon', [NewsController::class, 'requestAddon'])->name('news.request-addon');
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('upload.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/thumbnail', [ProfileController::class, 'updateThumbnail'])->name('profile.thumbnail');
    Route::get('/merchandise', [MerchandiseShipmentController::class, 'index'])->name('merchandise.index');
    Route::get('/merchandise/{merchandise}', [MerchandiseShipmentController::class, 'show'])->name('merchandise.show');
    Route::patch('/merchandise/{merchandise}/received', [MerchandiseShipmentController::class, 'confirmReceived'])->name('merchandise.received');
});

Route::get('/generate-card', [DashboardController::class, 'generateCard'])->name('generate-card');


Route::middleware('auth')->group(function () {
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
});

require __DIR__ . '/auth.php';

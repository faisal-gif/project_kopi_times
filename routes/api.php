<?php

use App\Http\Controllers\NewsController;
use App\Http\Controllers\TripayCallbackController;
use Illuminate\Support\Facades\Route;

Route::get('/news/show/{id}', [NewsController::class, 'apiShow'])->name('news.api.show');
Route::post('/tripay/callback', [TripayCallbackController::class, 'handle'])->name('api.tripay.callback');

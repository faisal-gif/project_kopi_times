<?php

namespace App\Http\Controllers;

use App\Models\News;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $auth = Auth::user();

        $total_news = News::where('pewarta_id', $auth->id)->count();
        $total_pending_news = News::where('pewarta_id', $auth->id)->where('status', 0)->count();
        $total_publish_news = News::where('pewarta_id', $auth->id)->where('status', 1)->count();

        return Inertia::render('Dashboard', [
            'total_news' => $total_news,
            'pending_news' => $total_pending_news,
            'publish_news' => $total_publish_news,
        ]);
    }
}

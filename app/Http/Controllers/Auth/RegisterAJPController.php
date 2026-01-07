<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use GuzzleHttp\Promise\Create;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegisterAJPController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/RegisterAJP');
    }

    
}

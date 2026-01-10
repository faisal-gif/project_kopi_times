<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Models\KategoriKt;
use App\Models\NewsPackage;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $newsPackages = NewsPackage::where('type', '4')->where('level', 1)->get();
        $kategoriKt = KategoriKt::select('kategori_id', 'name')->get();
        return Inertia::render('Auth/Register', [
            'newsPackages' => $newsPackages,
            'kategoriKt' => $kategoriKt,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterUserRequest $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'prov' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'contact' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'plan_id' => 'required|exists:news_package,id',
            'profesi' => 'required|exists:kategori_kt,kategori_id',
        ]);


        $user = User::create([
            'nama' => $request->name,
            'email' => $request->email,
            'prov' => $request->prov,
            'city' => $request->city,
            'address' => $request->address,
            'contact' => $request->contact,
            'kategori' => $request->profesi,
            'package_id' => $request->plan_id,
            'type' => 4,
            'password' => Hash::make($request->password),
            'status' => 0,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}

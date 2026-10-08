<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use App\Models\KategoriKt;
use App\Models\NewsPackage;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        // Query lebih dulu: cookie yang baru di-queue middleware belum terbaca di request yang sama.
        $code = request()->query('ref') ?: request()->cookie(config('affiliate.cookie_name'));
        $affiliate = Affiliate::resolveByCode($code);

        return Inertia::render('Auth/Register', [
            'newsPackages' => $newsPackages,
            'kategoriKt' => $kategoriKt,
            'referral' => $affiliate ? ['code' => $affiliate->code, 'name' => $affiliate->name] : null,
            'og' => [
                'title'       => 'Daftar Jadi Penulis — Kopi TIMES',
                'description' => 'Daftar membership penulis Kopi TIMES dan terbitkan opini Anda di TIMES Indonesia. Pilih paket, isi data, lalu mulai menulis.',
                'url'         => route('register'),
            ],
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


        $user = DB::transaction(function () use ($request) {
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

            $this->recordReferral($request, $user);

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Kunci atribusi referral sekali, saat user dibuat.
     *
     * Pendaftaran tidak pernah digagalkan karena urusan referral: kode yang tidak
     * dikenal, afiliator yang ditangguhkan, dan self-referral cukup diabaikan.
     */
    private function recordReferral(Request $request, User $user): void
    {
        $typed = $request->input('referral_code');
        $source = filled($typed) ? 'manual' : 'link';

        $code = filled($typed)
            ? $typed
            : ($request->input('ref') ?: $request->cookie(config('affiliate.cookie_name')));

        $affiliate = Affiliate::resolveByCode($code);

        if (! $affiliate) {
            return;
        }

        // Self-referral: afiliator mendaftarkan dirinya sendiri.
        if (filled($affiliate->email) && strcasecmp($affiliate->email, (string) $user->email) === 0) {
            return;
        }

        AffiliateReferral::create([
            'user_id' => $user->id,
            'affiliate_id' => $affiliate->id,
            'code' => $affiliate->code,
            'source' => $source,
        ]);
    }
}

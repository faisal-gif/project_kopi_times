<?php

namespace App\Http\Controllers;

use App\Mail\PaymentSuccessfulMail;
use App\Models\NewsPackage;
use App\Models\Payments;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use function Symfony\Component\Clock\now;

class TripayCallbackController extends Controller
{
    public function handle(Request $request)
    {
        $signature = hash_hmac(
            'sha256',
            $request->getContent(),
            config('services.tripay.private_key')
        );

        abort_if(
            $signature !== $request->header('X-Callback-Signature'),
            403
        );

        $data = $request->all();

        $payment = Payments::where('reference', $request->reference)->firstOrFail();

        if ($data['status'] === 'PAID') {
            DB::transaction(function () use ($payment, $data) {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),

                ]);


                $newsPackage = NewsPackage::find($payment->package_id);

                $user = User::find($payment->user_id);
                $user->quota_news += (int) $newsPackage->quota;

                if ($user->dateexp == null) {
                    $startDate = now();
                } elseif (now() > $user->dateexp) {
                    $startDate = now();
                } else {
                    $startDate = $user->dateexp;
                }

                // 3. Tambahkan durasi ke $startDate
                if ($newsPackage->jenis_periode == 'hari') {
                    $user->dateexp = $startDate->addDays($newsPackage->period);
                } elseif ($newsPackage->jenis_periode == 'bulan') {
                    $user->dateexp = $startDate->addMonths($newsPackage->period);
                } elseif ($newsPackage->jenis_periode == 'tahun') {
                    $user->dateexp = $startDate->addYears($newsPackage->period);
                }


                $user->package_id = $newsPackage->id;
                $user->status = 1;
                $user->type = $newsPackage->type;
                $user->save();

                DB::afterCommit(function () use ($user, $payment, $newsPackage) {
                    Mail::to($user->email)->send(new PaymentSuccessfulMail($payment, $user, $newsPackage));
                });
            });
        }

        return response()->json(['success' => true]);
    }
}

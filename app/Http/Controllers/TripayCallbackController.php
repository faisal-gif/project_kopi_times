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

        $statusDariTripay = strtolower($data['status']);

        if ($statusDariTripay === 'unpaid') {
            $statusDariTripay = 'pending';
        } elseif ($statusDariTripay === 'refund') {
            $statusDariTripay = 'refunded'; // Jika Tripay pakai 'refund' tapi DB kamu 'refunded'
        }

        if ($statusDariTripay === 'paid') {
            DB::transaction(function () use ($payment, $statusDariTripay, $data) {
                $payment->update([
                    'status' => $statusDariTripay,
                    'fee_merchant' => $data['fee_merchant'],
                    'fee_customer' => $data['fee_customer'],
                    'total_fee' => $data['total_fee'],
                    'total_amount' => $data['total_amount'],
                    'amount_recived' => $data['amount_received'],
                    'paid_at' => now(),
                ]);

                $newsPackage = NewsPackage::find($payment->package_id);
                $user = User::find($payment->user_id);

                $baseDate = $user->dateexp ? Carbon::parse($user->dateexp) : Carbon::now();

                switch ($newsPackage->jenis_periode) {
                    case 'hari':
                        $baseDate->addDays($newsPackage->period);
                        break;
                    case 'minggu':
                        $baseDate->addWeeks($newsPackage->period);
                        break;
                    case 'tahun':
                        $baseDate->addYears($newsPackage->period);
                        break;
                    case 'bulan':
                    default:
                        $baseDate->addMonths($newsPackage->period);
                        break;
                }

                $user->quota_news += $newsPackage->quota;
                $user->feed_instagram += $newsPackage->feed_instagram;
                $user->ekoran += $newsPackage->ekoran;
                $user->dateexp = $baseDate;
                $user->package_id = $newsPackage->id;
                $user->status = 1;
                $user->type = $newsPackage->type;
                $user->save();

                DB::afterCommit(function () use ($user, $payment, $newsPackage) {
                    Mail::to($user->email)->send(new PaymentSuccessfulMail($payment, $user, $newsPackage));
                });
            });
        } elseif (in_array($statusDariTripay, ['pending', 'failed', 'expired', 'refunded'])) {
            // Handle semua status selain paid di sini
            $payment->update([
                'status' => $statusDariTripay,
            ]);
        }

        return response()->json(['success' => true]);
    }
}

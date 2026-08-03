<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    protected $fillable = [
        'user_id',
        'package_id',
        'type',
        'merchant_ref',
        'reference',
        'method',
        'amount',
        'fee_merchant',
        'fee_customer',
        'total_fee',
        'total_amount',
        'amount_recived',
        'status',
        'checkout_url',
        'paid_at',
        'expired_at',
    ];

    protected $casts = [
        'paid_at'    => 'datetime',
        'expired_at' => 'datetime',
    ];

    public const STATUSES = [
        'pending'  => 'Menunggu Pembayaran',
        'paid'     => 'Lunas',
        'failed'   => 'Gagal',
        'expired'  => 'Kedaluwarsa',
        'refunded' => 'Dikembalikan',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function newsPackage()
    {
        return $this->belongsTo(NewsPackage::class, 'package_id');
    }

    public function merchandiseShipment()
    {
        return $this->hasOne(MerchandiseShipment::class, 'payment_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiseShipment extends Model
{
    protected $fillable = [
        'user_id',
        'payment_id',
        'item_name',
        'shipping_address',
        'status',
        'courier',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        'note',
    ];

    protected $casts = [
        'shipped_at'   => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public const STATUSES = [
        'pending'    => 'Menunggu Diproses',
        'processing' => 'Sedang Disiapkan',
        'shipped'    => 'Dalam Pengiriman',
        'delivered'  => 'Sudah Diterima',
        'cancelled'  => 'Dibatalkan',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getTrackingUrlAttribute(): ?string
    {
        if (! $this->tracking_number) return null;
        return 'https://cekresi.com/?noresi=' . $this->tracking_number;
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeFromPaidPayment($query)
    {
        return $query->whereHas('payment', fn($q) => $q->where('status', 'paid'));
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id');
    }
}

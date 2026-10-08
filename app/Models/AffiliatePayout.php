<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffiliatePayout extends Model
{
    protected $fillable = [
        'affiliate_id',
        'period_start',
        'period_end',
        'amount',
        'method',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'reference',
        'proof_path',
        'status',
        'paid_at',
        'note',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end'   => 'date',
        'paid_at'      => 'datetime',
    ];

    public const STATUSES = [
        'pending'   => 'Menunggu Transfer',
        'paid'      => 'Sudah Ditransfer',
        'cancelled' => 'Dibatalkan',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function scopeOwnedBy($query, $affiliateId)
    {
        return $query->where('affiliate_id', $affiliateId);
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class, 'payout_id');
    }
}

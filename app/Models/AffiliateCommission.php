<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffiliateCommission extends Model
{
    protected $fillable = [
        'payment_id',
        'user_id',
        'role',
        'affiliate_id',
        'source_affiliate_id',
        'base_amount',
        'rate_bps',
        'amount',
        'status',
        'status_note',
        'available_at',
        'payout_id',
        'approved_at',
        'paid_at',
    ];

    protected $casts = [
        'available_at' => 'datetime',
        'approved_at'  => 'datetime',
        'paid_at'      => 'datetime',
    ];

    public const STATUSES = [
        'accrued'    => 'Tercatat',
        'unassigned' => 'Tertahan',
        'approved'   => 'Siap Dicairkan',
        'rejected'   => 'Ditolak',
        'paid'       => 'Sudah Dibayar',
        'reversed'   => 'Dibatalkan',
    ];

    /** Label yang dilihat afiliator. Pos internal tidak pernah tampil di sisi publik. */
    public const ROLES = [
        'tier1'    => 'Komisi Langsung',
        'tier2'    => 'Komisi Jaringan',
        'internal' => 'Alokasi Internal',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getRoleLabelAttribute(): string
    {
        return self::ROLES[$this->role] ?? $this->role;
    }

    /** Komisi milik afiliator, tanpa pos internal yang memang tidak punya penerima. */
    public function scopeOwnedBy($query, $affiliateId)
    {
        return $query->where('affiliate_id', $affiliateId)->whereIn('role', ['tier1', 'tier2']);
    }

    public function scopePayable($query)
    {
        return $query->where('status', 'approved')->whereNull('payout_id');
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function sourceAffiliate()
    {
        return $this->belongsTo(Affiliate::class, 'source_affiliate_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id');
    }

    public function payout()
    {
        return $this->belongsTo(AffiliatePayout::class, 'payout_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

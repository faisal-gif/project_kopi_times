<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affiliate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'upline_id',
        'code',
        'name',
        'email',
        'phone',
        'payout_method',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'status',
        'approved_at',
        'note',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public const STATUSES = [
        'pending'   => 'Menunggu Persetujuan',
        'active'    => 'Aktif',
        'suspended' => 'Ditangguhkan',
        'inactive'  => 'Tidak Aktif',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Afiliator aktif pemilik kode. Kode tidak dikenal dan afiliator yang
     * ditangguhkan sama-sama menghasilkan null — pemanggil tidak perlu membedakannya.
     */
    public static function resolveByCode(?string $code): ?self
    {
        $code = strtoupper(trim((string) $code));

        if ($code === '') {
            return null;
        }

        return static::where('code', $code)->where('status', 'active')->first();
    }

    public function getReferralUrlAttribute(): string
    {
        return rtrim(url('/'), '/') . '/?ref=' . $this->code;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function upline()
    {
        return $this->belongsTo(self::class, 'upline_id');
    }

    public function downlines()
    {
        return $this->hasMany(self::class, 'upline_id');
    }

    public function referrals()
    {
        return $this->hasMany(AffiliateReferral::class);
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class);
    }

    public function payouts()
    {
        return $this->hasMany(AffiliatePayout::class);
    }
}

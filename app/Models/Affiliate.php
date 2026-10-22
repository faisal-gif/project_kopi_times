<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Affiliate extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'user_id',
        'upline_id',
        'tier2_eligible',
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
        'terms_accepted_at',
        'applicant_note',
        'note',
    ];

    protected $casts = [
        'tier2_eligible' => 'boolean',
        'approved_at' => 'datetime',
        'terms_accepted_at' => 'datetime',
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

    /**
     * Kode referral unik dari nama: maksimal 6 huruf nama + 4 karakter acak.
     * Formatnya mengikuti yang divalidasi middleware dan CMS: ^[A-Z0-9]{3,32}$
     */
    public static function generateCode(string $name): string
    {
        $prefix = substr(preg_replace('/[^A-Z]/', '', strtoupper($name)), 0, 6);

        if (strlen($prefix) < 3) {
            $prefix = 'KT' . $prefix;
        }

        do {
            $code = $prefix . strtoupper(Str::random(4));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    public function getReferralUrlAttribute(): string
    {
        return rtrim(url('/'), '/') . '/?ref=' . $this->code;
    }

    /** Tautan undangan jadi afiliator; penerimanya jadi downline akun ini. */
    public function getInviteUrlAttribute(): string
    {
        return rtrim(url('/'), '/') . '/undang-afiliator/' . $this->code;
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

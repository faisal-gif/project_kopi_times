<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffiliateReferral extends Model
{
    protected $fillable = [
        'user_id',
        'affiliate_id',
        'code',
        'source',
    ];

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }
}

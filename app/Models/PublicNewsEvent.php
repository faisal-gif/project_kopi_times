<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PublicNewsEvent extends Model
{
    protected $table = 'public_news_events';

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'enabled',
        'starts_at',
        'ends_at',
        'quota',
    ];

    protected $casts = [
        'enabled'   => 'boolean',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'quota'     => 'integer',
    ];

    // Slug dibuat otomatis dari name (unik). Route publik pakai slug ini.
    protected static function booted(): void
    {
        static::saving(function (self $event) {
            if (empty($event->slug) && $event->name) {
                $base = Str::slug($event->name);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->where('id', '!=', $event->id)->exists()) {
                    $slug = $base . '-' . ++$i;
                }
                $event->slug = $slug;
            }
        });
    }

    // Event terbuka untuk kiriman: enabled + dalam window + kuota tersisa.
    public function isOpen(): bool
    {
        $now = now();

        return $this->enabled
            && $this->starts_at <= $now
            && $this->ends_at >= $now
            && $this->quotaLeft() > 0;
    }

    // Semua kiriman berita publik untuk event ini.
    public function submissions()
    {
        return $this->hasMany(News::class, 'event_id');
    }

    // Jumlah kiriman guest untuk event ini (dihitung eksplisit via event_id).
    public function submissionCount(): int
    {
        return $this->submissions()->count();
    }

    public function quotaLeft(): int
    {
        return max(0, $this->quota - $this->submissionCount());
    }
}

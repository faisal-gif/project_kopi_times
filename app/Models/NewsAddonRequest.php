<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsAddonRequest extends Model
{
    protected $table = 'news_addon_requests';

    protected $fillable = [
        'news_id',
        'wartawan_id',
        'type',
        'jenis_request',
        'status',
    ];

    // Relasi balik ke berita
    public function news()
    {
        return $this->belongsTo(News::class, 'news_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsAddonRequest extends Model
{
    protected $table = 'news_addon_requests';

    protected $guarded = [];

    // Relasi balik ke berita
    public function news()
    {
        return $this->belongsTo(News::class, 'news_id');
    }
}

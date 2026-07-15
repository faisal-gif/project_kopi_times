<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsPackage extends Model
{
    protected $table = 'news_package';

    protected $casts = [
        'feature' => 'array',
    ];

    public function itemsLainnya()
    {
        return $this->hasMany(ItemsLainnya::class, 'news_package_id');
    }
}

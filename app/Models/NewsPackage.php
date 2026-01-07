<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsPackage extends Model
{
    protected $table = 'news_package';

    protected $casts = [
        'feature' => 'array',
    ];
}

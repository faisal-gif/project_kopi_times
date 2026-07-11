<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagesThumbnail extends Model
{
    protected $table = 'images_thumbnail';

    protected $fillable = [
        'user_id',
        'template_id',
        'image_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}

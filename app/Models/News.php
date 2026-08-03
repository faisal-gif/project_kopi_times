<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $table = 'news';
    protected $primaryKey = 'id';

    protected $fillable = [
        'is_code',
        'pewarta_id',
        'editor_id',
        'datetime',
        'datepub',
        'title',
        'content',
        'tags',
        'image',
        'caption',
        'url',
        'headline',
        'upload_to',
        'city',
        'narsum',
        'profesi',
        'contact',
        'description',
        'image2',
        'image3',
        'gmap_url',
        'type',
        'status',
        'created_by',
        'modified_by',
    ];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function writer()
    {
        return $this->belongsTo(User::class, 'pewarta_id');
    }

    // Tambahkan relasi ini
    public function addonRequests()
    {
        return $this->hasMany(NewsAddonRequest::class, 'news_id');
    }
}

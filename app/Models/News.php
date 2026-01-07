<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $table = 'news';
    protected $primaryKey = 'id';

    protected $guarded = [];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function writer()
    {
        return $this->belongsTo(User::class, 'pewarta_id');
    }
}

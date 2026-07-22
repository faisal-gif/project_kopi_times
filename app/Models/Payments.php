<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    protected $guarded = [];


    public function merchandiseShipment()
    {
        return $this->hasOne(MerchandiseShipment::class, 'payment_id');
    }
}

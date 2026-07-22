<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiseShipment extends Model
{
   protected $fillable = [
        'user_id', 'payment_id', 'item_name', 
        'shipping_address', 'status', 'tracking_number'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Atau menyesuaikan nama model Wartawan-mu
    }

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id');
    }
}

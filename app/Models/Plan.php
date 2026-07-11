<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Plan extends Model
{
    use LogsActivity;

    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 
        'max_branches', 'max_users', 'max_products', 'features'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'max_branches' => 'integer',
        'max_users' => 'integer',
        'max_products' => 'integer',
        'features' => 'array',
    ];

    protected static function booted()
    {
        static::saved(function ($plan) {
            Cache::forget('plan_limits_' . $plan->slug);
        });
        
        static::deleted(function ($plan) {
            Cache::forget('plan_limits_' . $plan->slug);
        });
    }
}

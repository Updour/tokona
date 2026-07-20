<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemHealth extends Model
{
    use HasFactory;

    protected $fillable = [
        'last_check_at',
        'next_maintenance_at',
        'status',
        'health_notes',
    ];

    protected $casts = [
        'last_check_at' => 'datetime',
        'next_maintenance_at' => 'datetime',
    ];
}

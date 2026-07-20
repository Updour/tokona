<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TelemetryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'ip',
        'os',
        'mac_address',
        'server_ip',
        'user_agent',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}

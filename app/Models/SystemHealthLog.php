<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemHealthLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'performed_by',
        'hardware_fingerprint',
        'ip_address',
        'user_agent',
    ];
}

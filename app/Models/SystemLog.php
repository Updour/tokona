<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'level',
        'message',
        'exception_class',
        'file',
        'line',
        'trace',
        'url',
        'ip_address',
    ];

    protected $casts = [
        'trace' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenants::class, 'tenant_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

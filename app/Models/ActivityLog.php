<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Builder;

class ActivityLog extends Model
{
    use HasFactory, HasUuids, Prunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where(function ($query) {
            // Hapus log biasa yang usianya lebih dari 30 hari
            $query->where('action', '!=', 'Hapus Data Penting')
                  ->where('created_at', '<=', now()->subDays(30));
        })->orWhere(function ($query) {
            // Hapus log kritikal (penghapusan) yang usianya lebih dari 90 hari
            $query->where('action', 'Hapus Data Penting')
                  ->where('created_at', '<=', now()->subDays(90));
        });
    }

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'user_id',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->morphTo();
    }
}

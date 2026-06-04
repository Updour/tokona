<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashRegisterShift extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'branch_id', 'user_id',
        'opened_at', 'closed_at',
        'opening_balance', 'closing_balance', 'expected_balance',
        'notes', 'status',
    ];

    protected function casts(): array
    {
        return [
            'opened_at'        => 'datetime',
            'closed_at'        => 'datetime',
            'opening_balance'  => 'decimal:2',
            'closing_balance'  => 'decimal:2',
            'expected_balance' => 'decimal:2',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'shift_id');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('status', 'closed');
    }

    // =========================================================================
    // Global Scope — tenant isolation
    // =========================================================================

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $query->where('cash_register_shifts.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function (self $model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}

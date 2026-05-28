<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class Customer extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'address',
        'tier',
        'points',
        'debt_balance',
        'is_active',
        'last_transaction_at',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    /** Logika filter pencarian data pelanggan & keanggotaan */
    public function scopeFilterMembership($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where(function($sq) use ($search) {
                $sq->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        })->when($filters['tier'] ?? null, function ($q, $tier) {
            if ($tier !== 'ALL') {
                $q->where('tier', $tier);
            }
        });
    }
}

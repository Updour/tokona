<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class Promo extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'value',
        'scope',
        'target_id',
        'min_qty',
        'min_amount',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    /** Logika penyaringan filter aturan promo/voucher */
    public function scopeFilterVouchers($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%");
        })->when($filters['status'] ?? null, function ($q, $status) {
            if ($status !== 'ALL') {
                $isActive = $status === 'active';
                $q->where('is_active', $isActive);
            }
        });
    }
}

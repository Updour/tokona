<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPerson extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'sales_people';

    protected $fillable = [
        'tenant_id', 'branch_id', 'name', 'phone', 'email',
        'commission_type', 'commission_value', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'commission_value' => 'float',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenants::class, 'tenant_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(SalesVisit::class, 'sales_id');
    }

    public function loadedStocks(): HasMany
    {
        return $this->hasMany(SalesLoadedStock::class, 'sales_person_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        })->when($filters['branch_id'] ?? null, function ($q, $branchId) {
            $q->where('branch_id', $branchId);
        })->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($q) use ($filters) {
            $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        })->when($filters['commission_type'] ?? null, function ($q, $commType) {
            $q->where('commission_type', $commType);
        });
    }
}

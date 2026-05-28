<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'title',
        'amount',
        'category',
        'note',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
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

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where('title', 'like', "%{$search}%");
        })->when($filters['branch_id'] ?? null, function ($q, $branchId) {
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        })->when($filters['category'] ?? null, function ($q, $category) {
            if ($category !== 'ALL') {
                $q->where('category', $category);
            }
        })->when($filters['start_date'] ?? null, function ($q, $startDate) {
            $q->whereDate('expense_date', '>=', $startDate);
        })->when($filters['end_date'] ?? null, function ($q, $endDate) {
            $q->whereDate('expense_date', '<=', $endDate);
        });
    }
}

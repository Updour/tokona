<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'invoice_number',
        'customer_id',
        'subtotal',
        'discount',
        'tax',
        'rounding_diff',
        'total',
        'paid_amount',
        'change_amount',
        'payment_method',
        'status',
        'created_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'rounding_diff' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where('invoice_number', 'like', "%{$search}%");
        })->when($filters['branch_id'] ?? null, function ($q, $branchId) {
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        })->when($filters['customer_id'] ?? null, function ($q, $customerId) {
            $q->where('customer_id', $customerId);
        })->when($filters['payment_method'] ?? null, function ($q, $method) {
            if ($method !== 'ALL') {
                $q->where('payment_method', $method);
            }
        })->when($filters['status'] ?? null, function ($q, $status) {
            if ($status !== 'ALL') {
                $q->where('status', $status);
            }
        })->when($filters['start_date'] ?? null, function ($q, $startDate) {
            $q->whereDate('created_at', '>=', $startDate);
        })->when($filters['end_date'] ?? null, function ($q, $endDate) {
            $q->whereDate('created_at', '<=', $endDate);
        });
    }
}

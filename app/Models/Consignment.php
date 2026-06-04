<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consignment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'consignments';

    protected $fillable = [
        'tenant_id', 'branch_id', 'supplier_id',
        'status', 'settled_at', 'consignment_date', 'due_date',
        'total_paid', 'total_discount', 'notes'
    ];

    protected $casts = [
        'settled_at' => 'datetime',
        'consignment_date' => 'date',
        'due_date' => 'date',
        'total_paid' => 'decimal:2',
        'total_discount' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('consignments.tenant_id', auth()->user()->tenant_id);
            }
        });
        
        static::creating(function ($model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConsignmentItem::class, 'consignment_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class PayrollComponent extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'amount',
        'is_taxable',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_taxable' => 'boolean',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }
}

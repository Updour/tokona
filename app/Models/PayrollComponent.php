<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollComponent extends Model
{
    use LogsActivity;

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
        static::creating(function ($model) {
            if (empty($model->tenant_id)) {
                if (config('app.current_tenant')) {
                    $model->tenant_id = config('app.current_tenant')->id;
                } elseif (auth()->check()) {
                    $model->tenant_id = auth()->user()->tenant_id;
                }
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && auth()->user()->isSuperAdmin()) {
                return;
            }

            if (config('app.current_tenant')) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', config('app.current_tenant')->id);
            }
        });
    }
}

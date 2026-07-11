<?php

namespace App\Models\Traits;

use App\Models\Tenants;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

trait BelongsToTenant
{
    use HasUuids;

    protected static function booted(): void
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

    public function tenant()
    {
        return $this->belongsTo(Tenants::class);
    }
}

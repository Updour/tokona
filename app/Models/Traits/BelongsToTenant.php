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
            if (empty($model->tenant_id) && auth()->check()) {
                $model->tenant_id = tenant()->id;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (tenant()) {
                $builder->where('tenant_id', tenant()->id);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenants::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'product_categories';

    protected $fillable = ['tenant_id', 'name', 'description'];

    public function products(): HasMany
    {
        return $this->hasMany(Products::class, 'category_id');
    }

    // =========================================================================
    // Local Scopes
    // =========================================================================

    /** Hanya ambil kolom yang dibutuhkan untuk dropdown form. */
    public function scopeForDropdown(Builder $query): Builder
    {
        return $query->select('id', 'name')->orderBy('name');
    }

    /** Filter berdasarkan pencarian nama. */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where('name', 'like', "%{$term}%");
    }

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function ($query) {
            if (auth()->check() && !auth()->user()->is_super_admin) {
                $query->where('product_categories.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}

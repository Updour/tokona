<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'address',
        'phone', 'latitude', 'longitude', 'is_main',
        'pos_settings',
    ];

    protected function casts(): array
    {
        return [
            'is_main' => 'boolean',
            'pos_settings' => 'array',
        ];
    }

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenants::class, 'tenant_id');
    }

    // =========================================================================
    // Local Scopes
    // =========================================================================

    /** Filter cabang milik tenant tertentu. */
    public function scopeForTenant(Builder $query, string $tenantId): Builder
    {
        return $query->where('tenant_id', $tenantId);
    }

    /** Hanya ambil kolom yang dibutuhkan untuk dropdown form. */
    public function scopeForDropdown(Builder $query): Builder
    {
        return $query->select('id', 'tenant_id', 'name', 'code')->orderBy('name');
    }

    /** Logika penyaringan filter cabang global */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where(function ($sq) use ($search) {
                $sq->where('name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
            });
        });
    }
}

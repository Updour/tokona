<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne; // Tambahkan import ini
use Illuminate\Support\Str;
// use App\Models\TenantMedia;


#[Fillable([
    'id',
    'name',
    'slug',
    'email',
    'phone',
    'logo',
    'address',
    'status',
    'plan',
    'expires_at',
    'settings',
])]
class Tenants extends Model
{
    use HasFactory, HasUuids;

    protected static function booted()
    {
        static::creating(function ($tenant) {
            if (empty($tenant->slug)) {
                $slug = Str::slug($tenant->name);
                $count = Tenants::where('slug', 'like', "$slug%")->count();
                $tenant->slug = $count ? "{$slug}-{$count}" : $slug;
            }
            if (empty($tenant->expires_at)) {
                // Set default trial to 30 days
                $tenant->expires_at = now()->addDays(30);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'plan' => 'string',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'settings' => 'array',
        ];
    }

    /**
     * RELASI SATU KE SATU (One-to-One) ke Model TenantLocations.
     */
    public function location(): HasOne
    {
        return $this->hasOne(TenantLocations::class, 'tenant_id');
    }


    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class);
    }

    public function locations()
    {
        return $this->hasMany(TenantLocations::class);
    }

    public function media()
    {
        return $this->hasMany(TenantMedia::class, 'tenant_id');
    }

    // =========================================================================
    // Local Scopes
    // =========================================================================

    /** Hanya ambil kolom yang dibutuhkan untuk dropdown form. */
    public function scopeForDropdown(Builder $query): Builder
    {
        return $query->select('id', 'name')->orderBy('name');
    }

    /**
     * Helper untuk mengambil konfigurasi Poin Loyalitas
     */
    public function getLoyaltySettings(): array
    {
        $settings = $this->settings ?? [];
        return [
            // Default: Tiap kelipatan Rp 10.000 dapat 1 Poin
            'earn_amount' => $settings['loyalty_earn_amount'] ?? 10000,
            
            // Default: 1 Poin ditukar diskon Rp 1
            'redeem_rate' => $settings['loyalty_redeem_rate'] ?? 1,
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'id',
    'tenant_id',
    'latitude',
    'longitude',
    'address_text',
    'city',
    'province',
    'maps_link',
])]
class TenantLocations extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // 🔗 relasi ke tenant
    public function tenant()
    {
        return $this->belongsTo(Tenants::class);
    }
}
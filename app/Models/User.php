<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable; // Tambahkan import ini
use App\Traits\LogsActivity;

#[Fillable([
    'id',
    'name',
    'email',
    'email_verified_at',
    'password',
    'tenant_id',
    'branch_id',
    'nip',
    'position',
    'employment_status',
    'join_date',
    'phone',
    'avatar',
    'status',
    'last_login_at',
    'remember_token'
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    use LogsActivity;
    use HasFactory, HasUuids, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // booted method removed to prevent infinite recursion during Auth::user() resolution
    /**
     * Relasi Utama Banyak-ke-Banyak (Many-to-Many).
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function role(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function getRoleAttribute()
    {
        return $this->roles->first();
    }

    /**
     * Helper untuk mengecek hak akses Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->roles->contains('name', 'super-admin');
    }

    /**
     * Helper untuk mengecek hak akses Owner (Pemilik Toko).
     */
    public function isOwner(): bool
    {
        return $this->roles->contains('name', 'owner');
    }

    /**
     * Check if user has a specific permission key.
     */
    public function hasPermission(string $permissionKey): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Gunakan pemuatan relasi ter-cache untuk mencegah pembengkakan N+1 query database
        if (!$this->relationLoaded('roles') || !$this->roles->every(fn($r) => $r->relationLoaded('permissions'))) {
            $this->load('roles.permissions');
        }

        return $this->roles->contains(function ($role) use ($permissionKey) {
            return $role->permissions->contains('key', $permissionKey);
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

    public function employeeSalary()
    {
        return $this->hasOne(EmployeeSalary::class, 'user_id');
    }
}

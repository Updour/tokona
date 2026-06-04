<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleService
{
    /**
     * Get list of roles and permissions for the current tenant.
     */
    public function getRoleListData(array $filters): array
    {
        $tenantId = auth()->user()->tenant_id;
        if (auth()->user()->isSuperAdmin() && !$tenantId) {
            $tenantId = \App\Models\Tenants::first()?->id;
        }

        // Scoped by tenant
        $roles = Role::where('tenant_id', $tenantId)
            ->with('permissions')
            ->orderBy('name')
            ->get();

        // Get all available permissions grouped by module for the UI
        $permissionsQuery = Permission::orderBy('module')->orderBy('name');

        if (!auth()->user()->isSuperAdmin()) {
            $permissionsQuery->where('key', '!=', 'superadmin.access');
        }

        $permissions = $permissionsQuery->get()->groupBy('module');

        return [
            'roles' => $roles,
            'permissionsGrouped' => $permissions,
        ];
    }

    /**
     * Create a new role.
     */
    public function createRole(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $tenantId = auth()->user()->tenant_id;
            if (auth()->user()->isSuperAdmin() && !$tenantId) {
                $tenantId = \App\Models\Tenants::first()?->id;
            }

            $role = Role::create([
                'tenant_id' => $tenantId,
                'name' => Str::slug($data['name']),
                'description' => $data['description'] ?? null,
            ]);

            if (!empty($data['permissions'])) {
                $role->permissions()->sync($data['permissions']);
            }

            return $role;
        });
    }

    /**
     * Update an existing role and sync its permissions.
     */
    public function updateRole(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update([
                'description' => $data['description'] ?? null,
            ]);

            if (isset($data['permissions'])) {
                $role->permissions()->sync($data['permissions']);
            }

            return $role;
        });
    }

    /**
     * Delete a role.
     */
    public function deleteRole(Role $role): void
    {
        DB::transaction(function () use ($role) {
            // Cannot delete default tenant roles if needed, or simply delete
            $role->permissions()->detach();
            $role->delete();
        });
    }
}

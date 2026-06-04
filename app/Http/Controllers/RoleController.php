<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Tampilkan halaman daftar role & permission.
     */
    public function index(Request $request): Response
    {
        $data = $this->roleService->getRoleListData($request->all());
        return Inertia::render('roles/Index', $data);
    }

    /**
     * Simpan role baru.
     */
    public function store(\App\Http\Requests\StoreRoleRequest $request): RedirectResponse
    {
        $this->roleService->createRole($request->validated());
        return redirect()->back()->with('success', 'Role baru berhasil dibuat.');
    }

    /**
     * Update role & sync permissions.
     */
    public function update(\App\Http\Requests\UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->roleService->updateRole($role, $request->validated());
        return redirect()->back()->with('success', 'Role & Hak Akses berhasil diperbarui.');
    }

    /**
     * Hapus role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Cegah penghapusan super-admin, owner secara tidak sengaja
        if (in_array($role->name, ['super-admin', 'owner'])) {
            return redirect()->back()->with('error', 'Role sistem bawaan tidak dapat dihapus.');
        }

        $this->roleService->deleteRole($role);

        return redirect()->back()->with('success', 'Role berhasil dihapus.');
    }
}

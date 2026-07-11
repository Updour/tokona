<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller implements HasMiddleware
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                if (! auth()->user()->isSuperAdmin() && ! auth()->user()->isOwner()) {
                    abort(403, 'Akses ditolak. Hanya Super Admin dan Pemilik Toko yang dapat mengelola hak akses dan peran.');
                }

                return $next($request);
            }),
        ];
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
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->roleService->createRole($request->validated());

        return redirect()->back()->with('success', 'Role baru berhasil dibuat.');
    }

    /**
     * Update role & sync permissions.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
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

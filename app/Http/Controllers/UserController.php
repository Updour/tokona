<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Models\Branch;
use App\Models\Role;
use App\Models\Tenants;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'branch:id,name', 'tenant:id,name']);

        // Search logic
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Branch, Tenant, & Status Filters
        if ($request->filled('tenant_id') && $request->input('tenant_id') !== 'ALL') {
            $query->where('tenant_id', $request->input('tenant_id'));
        }

        if ($request->filled('branch_id') && $request->input('branch_id') !== 'ALL') {
            $query->where('branch_id', $request->input('branch_id'));
        }

        if ($request->filled('status') && $request->input('status') !== 'ALL') {
            $query->where('status', $request->input('status'));
        }

        // Sorting logic
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        $allowedSorts = ['name', 'email', 'status', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $users = $query->paginate($request->input('per_page', 10))->withQueryString();

        // Get branches dropdown options
        $branchesQuery = Branch::select('id', 'name', 'tenant_id')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $branches = $branchesQuery->get();

        // Get roles dropdown options
        $rolesQuery = Role::orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $rolesQuery->where('tenant_id', auth()->user()->tenant_id)
                ->where('name', '!=', 'super-admin');
        }
        $roles = $rolesQuery->get();

        // Get tenants dropdown options (Super Admin only)
        $tenants = [];
        if (auth()->user()->isSuperAdmin()) {
            $tenants = Tenants::select('id', 'name')->orderBy('name')->get();
        }

        return Inertia::render('users/Index', [
            'users' => $users,
            'branches' => $branches,
            'roles' => $roles,
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page', 'branch_id', 'status', 'tenant_id']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        // Determine tenant_id
        if (!auth()->user()->isSuperAdmin()) {
            $validated['tenant_id'] = auth()->user()->tenant_id;
        } else {
            // Super Admin infers the tenant from the selected branch
            $branch = Branch::findOrFail($validated['branch_id']);
            $validated['tenant_id'] = $branch->tenant_id;
        }

        // Create the user
        $user = User::create($validated);

        // Sync the role
        $user->roles()->sync([$validated['role_id']]);

        return redirect()->route('users.index')->with('success', 'Karyawan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Update the user
        $user->update($validated);

        // Sync the role
        $user->roles()->sync([$validated['role_id']]);

        return redirect()->route('users.index')->with('success', 'Data karyawan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Protect against deleting yourself
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'Karyawan berhasil dihapus.');
    }
}

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

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'branch:id,name', 'tenant:id,name']);

        if (!auth()->user()->isSuperAdmin()) {
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super-admin');
            });
        }

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
        } else {
            // Super Admin sees all roles (will be filtered in React by selected tenant)
        }
        $roles = $rolesQuery->get();

        // Get tenants dropdown options (Super Admin only)
        $tenants = [];
        if (auth()->user()->isSuperAdmin()) {
            $tenants = Tenants::select('id', 'name')->orderBy('name')->get();
        }

        return Inertia::render('employees/Index', [
            'users' => $users,
            'branches' => $branches,
            'roles' => $roles,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page', 'branch_id', 'status']),
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
            
            // Check subscription limit for employees
            $tenant = Tenants::find(auth()->user()->tenant_id);
            $subService = new \App\Services\SubscriptionService();
            if ($tenant && !$subService->canAddUser($tenant)) {
                return redirect()->back()->with('error', 'Limit jumlah karyawan tercapai! Silakan upgrade paket langganan Anda untuk menambah karyawan baru.');
            }
        } else {
            // Super Admin
            $validated['tenant_id'] = $request->input('tenant_id');
        }

        // Create the user
        $user = User::create($validated);

        // Adjust role_id to target tenant if Super Admin
        $roleId = $validated['role_id'];
        if (auth()->user()->isSuperAdmin()) {
            $selectedRole = Role::find($roleId);
            if ($selectedRole && $selectedRole->tenant_id !== $validated['tenant_id']) {
                $targetRole = Role::where('name', $selectedRole->name)
                    ->where('tenant_id', $validated['tenant_id'])
                    ->first();
                if ($targetRole) {
                    $roleId = $targetRole->id;
                }
            }
        }

        // Sync the role
        $user->roles()->sync([$roleId]);

        // Save Basic Salary if provided
        if (isset($validated['basic_salary'])) {
            app(\App\Services\EmployeeSalaryService::class)->setSalary($user->id, [
                'basic_salary' => $validated['basic_salary']
            ]);
        }

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil ditambahkan.');
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

        // Adjust role_id to target tenant if Super Admin
        $roleId = $validated['role_id'];
        if (auth()->user()->isSuperAdmin() && isset($validated['tenant_id'])) {
            $selectedRole = Role::find($roleId);
            $targetTenantId = $validated['tenant_id'] ?? $user->tenant_id;
            if ($selectedRole && $selectedRole->tenant_id !== $targetTenantId) {
                $targetRole = Role::where('name', $selectedRole->name)
                    ->where('tenant_id', $targetTenantId)
                    ->first();
                if ($targetRole) {
                    $roleId = $targetRole->id;
                }
            }
        }

        // Sync the role
        $user->roles()->sync([$roleId]);

        // Save Basic Salary if provided
        if (isset($validated['basic_salary'])) {
            app(\App\Services\EmployeeSalaryService::class)->setSalary($user->id, [
                'basic_salary' => $validated['basic_salary']
            ]);
        }

        return redirect()->route('employees.index')->with('success', 'Data karyawan berhasil diperbarui.');
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

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil dihapus.');
    }
}

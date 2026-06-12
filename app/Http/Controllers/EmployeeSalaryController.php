<?php

namespace App\Http\Controllers;

use App\Http\Requests\HRIS\UpdateEmployeeSalaryRequest;
use App\Models\Branch;
use App\Models\Tenants;
use App\Models\Role;
use App\Services\EmployeeSalaryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeSalaryController extends Controller
{
    public function __construct(
        private readonly EmployeeSalaryService $salaryService
    ) {}

    public function index(Request $request)
    {
        $employees = $this->salaryService->getEmployeesWithSalary($request->all());

        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        $rolesQuery = Role::orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $rolesQuery->where('tenant_id', auth()->user()->tenant_id)
                ->where('name', '!=', 'super-admin');
        }
        $roles = $rolesQuery->get();

        return Inertia::render('hris/salaries/Index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'branch_id', 'tenant_id']),
            'branches' => $branchesQuery->get(),
            'roles' => $roles,
            'tenants' => auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->orderBy('name')->get() : null,
            'is_super_admin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function update(UpdateEmployeeSalaryRequest $request, $userId)
    {
        try {
            $this->salaryService->setSalary($userId, $request->validated());
            return redirect()->back()->with('success', 'Gaji pokok berhasil diatur.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengatur gaji: ' . $e->getMessage());
        }
    }
}

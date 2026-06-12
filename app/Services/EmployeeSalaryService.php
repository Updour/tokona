<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmployeeSalary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeSalaryService
{
    /**
     * Get paginated employees with their salary info
     */
    public function getEmployeesWithSalary(array $filters = [])
    {
        $query = User::with(['employeeSalary', 'branch'])
            ->orderBy('name');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }
        
        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        // Handle Tenant filtering
        if (auth()->user()->isSuperAdmin()) {
            if (!empty($filters['tenant_id'])) {
                $query->where('tenant_id', $filters['tenant_id']);
            }
        } else {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Set basic salary for an employee
     */
    public function setSalary(string $userId, array $data)
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::findOrFail($userId);

            $salary = EmployeeSalary::where('user_id', $userId)->first();

            if ($salary) {
                $salary->update([
                    'basic_salary' => $data['basic_salary'],
                ]);
            } else {
                $salary = EmployeeSalary::create([
                    'id' => Str::uuid()->toString(),
                    'user_id' => $userId,
                    'basic_salary' => $data['basic_salary'],
                    'payment_type' => 'monthly', // Default assumption
                ]);
            }

            return $salary;
        });
    }
}

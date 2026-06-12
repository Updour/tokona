<?php

namespace App\Services;

use App\Models\EmployeeSalary;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollComponent;
use App\Models\Attendance;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Calculate automatic modifiers (Overtime, Lateness) from Attendance.
     */
    private function calculateAttendanceModifiers(string $userId, int $month, int $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $attendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $lateDays = 0;
        $overtimeHours = 0;

        foreach ($attendances as $attendance) {
            if ($attendance->check_in_time) {
                $checkIn = Carbon::parse($attendance->check_in_time);
                // Standard check in is 08:00
                if ($checkIn->format('H:i:s') > '08:00:00') {
                    $lateDays++;
                }
            }
            if ($attendance->check_out_time) {
                $checkOut = Carbon::parse($attendance->check_out_time);
                // Standard check out is 17:00
                if ($checkOut->format('H:i:s') > '17:00:00') {
                    $diffInMinutes = $checkOut->diffInMinutes(Carbon::parse($attendance->date . ' 17:00:00'));
                    $overtimeHours += ($diffInMinutes / 60);
                }
            }
        }

        $modifiers = [];

        // Try to find default component values if they exist, otherwise use a fallback
        $lateDeductionComponent = PayrollComponent::where('name', 'Potongan Telat')->first();
        $overtimeAllowanceComponent = PayrollComponent::where('name', 'Uang Lembur')->first();

        $lateRate = $lateDeductionComponent ? $lateDeductionComponent->amount : 50000; // default 50k per late day
        $overtimeRate = $overtimeAllowanceComponent ? $overtimeAllowanceComponent->amount : 25000; // default 25k per hour

        if ($lateDays > 0) {
            $modifiers['deductions'][] = [
                'name' => "Potongan Telat ({$lateDays} hari)",
                'amount' => $lateDays * $lateRate,
            ];
        }

        if ($overtimeHours > 0) {
            $overtimeHoursRounded = round($overtimeHours, 1);
            $modifiers['allowances'][] = [
                'name' => "Uang Lembur ({$overtimeHoursRounded} jam)",
                'amount' => $overtimeHoursRounded * $overtimeRate,
            ];
        }

        return $modifiers;
    }

    /**
     * Get active default payroll components
     */
    private function getDefaultComponents(string $tenantId): array
    {
        $components = PayrollComponent::where('tenant_id', $tenantId)->get();
        $allowances = [];
        $deductions = [];

        foreach ($components as $c) {
            // Skip automated attendance components as they are handled dynamically
            if (in_array($c->name, ['Potongan Telat', 'Uang Lembur'])) continue;

            if ($c->type === 'allowance') {
                $allowances[] = ['name' => $c->name, 'amount' => $c->amount];
            } else {
                $deductions[] = ['name' => $c->name, 'amount' => $c->amount];
            }
        }

        return ['allowances' => $allowances, 'deductions' => $deductions];
    }

    /**
     * Generate payroll for a user for a specific month
     */
    public function generatePayroll(string $userId, int $month, int $year, array $allowances = [], array $deductions = [], bool $includeDefaults = true)
    {
        return DB::transaction(function () use ($userId, $month, $year, $allowances, $deductions, $includeDefaults) {
            $salary = EmployeeSalary::where('user_id', $userId)->first();
            if (!$salary) {
                throw new \Exception("Gaji pokok belum disetel untuk karyawan ini.");
            }

            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            // Check if payroll already exists
            $existing = Payroll::where('user_id', $userId)
                ->where('period_start', $startDate->toDateString())
                ->first();

            if ($existing) {
                if ($existing->status === 'paid') {
                    throw new \Exception("Payroll bulan ini sudah dibayar.");
                }
                $existing->items()->delete();
                $existing->delete();
            }

            $employee = \App\Models\User::find($userId);

            if ($includeDefaults) {
                $defaults = $this->getDefaultComponents($employee->tenant_id);
                $allowances = array_merge($allowances, $defaults['allowances']);
                $deductions = array_merge($deductions, $defaults['deductions']);

                $attendanceModifiers = $this->calculateAttendanceModifiers($userId, $month, $year);
                if (isset($attendanceModifiers['allowances'])) {
                    $allowances = array_merge($allowances, $attendanceModifiers['allowances']);
                }
                if (isset($attendanceModifiers['deductions'])) {
                    $deductions = array_merge($deductions, $attendanceModifiers['deductions']);
                }
            }

            $totalAllowance = 0;
            $totalDeduction = 0;
            $items = [];

            foreach ($allowances as $allowance) {
                $amount = floatval($allowance['amount']);
                if ($amount <= 0) continue;
                $totalAllowance += $amount;
                $items[] = [
                    'id' => Str::uuid()->toString(),
                    'name' => $allowance['name'],
                    'type' => 'allowance',
                    'amount' => $amount,
                ];
            }

            foreach ($deductions as $deduction) {
                $amount = floatval($deduction['amount']);
                if ($amount <= 0) continue;
                $totalDeduction += $amount;
                $items[] = [
                    'id' => Str::uuid()->toString(),
                    'name' => $deduction['name'],
                    'type' => 'deduction',
                    'amount' => $amount,
                ];
            }

            $basic = $salary->basic_salary;
            $net = $basic + $totalAllowance - $totalDeduction;

            $payroll = Payroll::create([
                'tenant_id' => $employee->tenant_id,
                'branch_id' => $employee->branch_id,
                'user_id' => $userId,
                'period_start' => $startDate->toDateString(),
                'period_end' => $endDate->toDateString(),
                'basic_salary' => $basic,
                'total_allowance' => $totalAllowance,
                'total_deduction' => $totalDeduction,
                'net_salary' => $net,
                'status' => 'draft',
            ]);

            foreach ($items as $item) {
                PayrollItem::create([
                    'id' => $item['id'],
                    'payroll_id' => $payroll->id,
                    'name' => $item['name'],
                    'type' => $item['type'],
                    'amount' => $item['amount'],
                ]);
            }

            return $payroll->load('items');
        });
    }

    /**
     * Bulk generate payroll for all active employees
     */
    public function bulkGeneratePayroll(string $tenantId, int $month, int $year)
    {
        $salaries = EmployeeSalary::whereHas('user', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)->where('status', 'active');
        })->get();

        $generatedCount = 0;

        foreach ($salaries as $salary) {
            try {
                $this->generatePayroll($salary->user_id, $month, $year, [], [], true);
                $generatedCount++;
            } catch (\Exception $e) {
                // Skip if already paid or error
                continue;
            }
        }

        return $generatedCount;
    }

    public function markAsPaid(Payroll $payroll)
    {
        if ($payroll->status === 'paid') {
            throw new \Exception("Payroll sudah dibayar.");
        }

        return DB::transaction(function () use ($payroll) {
            $payroll->update(['status' => 'paid']);

            // Integrate with Expense Ledger
            $userName = $payroll->user ? $payroll->user->name : 'Karyawan';
            $period = Carbon::parse($payroll->period_start)->format('M Y');
            
            Expense::create([
                'tenant_id' => $payroll->tenant_id,
                'branch_id' => $payroll->branch_id,
                'category' => 'Beban Gaji',
                'amount' => $payroll->net_salary,
                'date' => now()->toDateString(),
                'description' => "Pembayaran Slip Gaji {$userName} periode {$period}",
                'reference_number' => "PAYROLL-" . explode('-', $payroll->id)[0],
            ]);

            return $payroll;
        });
    }
}

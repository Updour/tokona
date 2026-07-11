<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\CashAdvance;
use App\Models\CashBook;
use App\Models\EmployeeSalary;
use App\Models\Expense;
use App\Models\Payroll;
use App\Models\PayrollCashAdvance;
use App\Models\PayrollComponent;
use App\Models\PayrollItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollService
{
    /**
     * Calculate automatic modifiers (Overtime, Lateness) from Attendance.
     */
    private function calculateAttendanceModifiers(string $userId, int $month, int $year): array
    {
        $employee = User::find($userId);
        $tenantId = $employee ? $employee->tenant_id : null;

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $attendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $lateDays = 0;
        $overtimeHours = 0;

        // Ambil konfigurasi jam shift kerja tenant (default 08:00 dan 17:00)
        $tenant = \App\Models\Tenants::find($tenantId);
        $settings = $tenant ? $tenant->settings : [];
        $checkInLimit = $settings['work_shift_start'] ?? '08:00:00';
        $checkOutLimit = $settings['work_shift_end'] ?? '17:00:00';

        foreach ($attendances as $attendance) {
            if ($attendance->check_in_time) {
                $checkIn = Carbon::parse($attendance->check_in_time);
                if ($checkIn->format('H:i:s') > $checkInLimit) {
                    $lateDays++;
                }
            }
            if ($attendance->check_out_time) {
                $checkOut = Carbon::parse($attendance->check_out_time);
                if ($checkOut->format('H:i:s') > $checkOutLimit) {
                    $diffInMinutes = $checkOut->diffInMinutes(Carbon::parse($attendance->date.' '.$checkOutLimit));
                    $overtimeHours += ($diffInMinutes / 60);
                }
            }
        }

        $modifiers = [];

        // Filter komponen berdasarkan tenant_id untuk mencegah kebocoran data antar-tenant
        $lateDeductionComponent = PayrollComponent::where('tenant_id', $tenantId)->where('name', 'Potongan Telat')->first();
        $overtimeAllowanceComponent = PayrollComponent::where('tenant_id', $tenantId)->where('name', 'Uang Lembur')->first();

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
            if (in_array($c->name, ['Potongan Telat', 'Uang Lembur'])) {
                continue;
            }

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
            if (! $salary) {
                throw new \Exception('Gaji pokok belum disetel untuk karyawan ini.');
            }

            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            // Check if payroll already exists
            $existing = Payroll::where('user_id', $userId)
                ->where('period_start', $startDate->toDateString())
                ->first();

            if ($existing) {
                if ($existing->status === 'paid') {
                    throw new \Exception('Payroll bulan ini sudah dibayar.');
                }
                $existing->items()->delete();
                $existing->delete();
            }

            $employee = User::find($userId);

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
                if ($amount <= 0) {
                    continue;
                }
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
                if ($amount <= 0) {
                    continue;
                }
                $totalDeduction += $amount;
                $items[] = [
                    'id' => Str::uuid()->toString(),
                    'name' => $deduction['name'],
                    'type' => 'deduction',
                    'amount' => $amount,
                ];
            }

            $basic = $salary->basic_salary;
            $availableForDeduction = $basic + $totalAllowance - $totalDeduction;

            // --- KASBON LOGIC ---
            $cashAdvances = CashAdvance::where('user_id', $userId)
                ->where('status', 'approved')
                ->where('remaining_amount', '>', 0)
                ->orderBy('date', 'asc')
                ->get();

            $totalKasbonDeducted = 0;
            $cashAdvanceDeductions = [];

            foreach ($cashAdvances as $kasbon) {
                if ($availableForDeduction <= 0) {
                    break;
                } // Cannot deduct anymore

                $canDeduct = min($kasbon->remaining_amount, $availableForDeduction);
                $totalKasbonDeducted += $canDeduct;
                $availableForDeduction -= $canDeduct;

                $cashAdvanceDeductions[] = [
                    'id' => Str::uuid()->toString(),
                    'cash_advance_id' => $kasbon->id,
                    'name' => 'Potongan Kasbon Tgl: '.Carbon::parse($kasbon->date)->format('d/m/Y'),
                    'type' => 'deduction',
                    'amount' => $canDeduct,
                ];
            }

            // Tambahkan potongan kasbon ke list items
            foreach ($cashAdvanceDeductions as $cad) {
                $items[] = [
                    'id' => $cad['id'],
                    'name' => $cad['name'],
                    'type' => $cad['type'],
                    'amount' => $cad['amount'],
                ];
            }

            $totalDeduction += $totalKasbonDeducted;
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

            // Save pivot for Kasbon tracking
            foreach ($cashAdvanceDeductions as $cad) {
                PayrollCashAdvance::create([
                    'payroll_id' => $payroll->id,
                    'cash_advance_id' => $cad['cash_advance_id'],
                    'amount_deducted' => $cad['amount'],
                ]);
            }

            return $payroll->load('items');
        });
    }

    /**
     * Bulk generate payroll for all active employees
     */
    public function bulkGeneratePayroll(?string $tenantId, int $month, int $year)
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
            throw new \Exception('Payroll sudah dibayar.');
        }

        return DB::transaction(function () use ($payroll) {
            $payroll->update(['status' => 'paid']);

            // Integrate with Expense Ledger
            $userName = $payroll->user ? $payroll->user->name : 'Karyawan';
            $period = Carbon::parse($payroll->period_start)->format('M Y');

            $pivots = PayrollCashAdvance::where('payroll_id', $payroll->id)->get();
            $totalKasbonDeducted = $pivots->sum('amount_deducted');

            // Tahap 1: Beban Gaji (Expense) harus mencatat total gross yang dibayarkan perusahaan
            $grossExpenseAmount = $payroll->net_salary + $totalKasbonDeducted;

            Expense::create([
                'tenant_id' => $payroll->tenant_id,
                'branch_id' => $payroll->branch_id,
                'title' => "Beban Gaji {$userName} periode {$period}",
                'category' => 'Beban Gaji',
                'amount' => $grossExpenseAmount,
                'expense_date' => now()->toDateString(),
                'note' => "Total Gaji {$grossExpenseAmount} (Termasuk potongan kasbon {$totalKasbonDeducted})",
            ]);

            // Tahap 2: Potong sisa hutang Kasbon & Kembalikan Kas
            foreach ($pivots as $pivot) {
                $ca = CashAdvance::find($pivot->cash_advance_id);
                if ($ca) {
                    $ca->remaining_amount -= $pivot->amount_deducted;
                    if ($ca->remaining_amount <= 0) {
                        $ca->status = 'paid';
                        $ca->remaining_amount = 0; // Prevent floating point negative
                    }
                    $ca->save();

                    // Kembalikan saldo kasir dari potongan kasbon (Pelunasan Piutang)
                    // Karena Expense di atas sudah memotong laci kasir sebesar Gross,
                    // kita kembalikan sebesar potongan kasbon agar kas keluar murni hanya Net Salary
                    CashBook::create([
                        'tenant_id' => $payroll->tenant_id,
                        'branch_id' => $payroll->branch_id,
                        'type' => 'in',
                        'category' => 'Pelunasan Piutang Karyawan',
                        'amount' => $pivot->amount_deducted,
                        'reference_type' => 'CashAdvance',
                        'reference_id' => $ca->id,
                        'note' => "Pelunasan Kasbon via Potong Gaji: {$userName}",
                        'created_by' => auth()->id() ?? $ca->user_id,
                    ]);
                }
            }

            return $payroll;
        });
    }
}

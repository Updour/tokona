<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Branch;
use App\Models\Tenants;

class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService
    ) {}

    public function index(Request $request)
    {
        $query = Payroll::with(['user', 'branch', 'items'])->orderBy('period_start', 'desc');

        if ($request->filled('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }
        
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        
        if (auth()->user()->isSuperAdmin() && $request->filled('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        $payrolls = $query->paginate($request->get('per_page', 15));
        
        // Filter employees based on Super Admin scope
        $employeesQuery = User::orderBy('name');
        if (auth()->user()->isSuperAdmin() && $request->filled('tenant_id')) {
            $employeesQuery->where('tenant_id', $request->tenant_id);
        } elseif (!auth()->user()->isSuperAdmin()) {
            $employeesQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $employees = $employeesQuery->get();

        $branchesQuery = Branch::select('id', 'name')->orderBy('name');
        if (!auth()->user()->isSuperAdmin()) {
            $branchesQuery->where('tenant_id', auth()->user()->tenant_id);
        }

        return Inertia::render('hris/payrolls/Index', [
            'payrolls' => $payrolls,
            'employees' => $employees,
            'filters' => $request->only(['search', 'branch_id', 'tenant_id']),
            'branches' => $branchesQuery->get(),
            'tenants' => auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->orderBy('name')->get() : null,
            'is_super_admin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
            'allowances' => 'nullable|array',
            'allowances.*.name' => 'required_with:allowances|string',
            'allowances.*.amount' => 'required_with:allowances|numeric|min:0',
            'deductions' => 'nullable|array',
            'deductions.*.name' => 'required_with:deductions|string',
            'deductions.*.amount' => 'required_with:deductions|numeric|min:0',
        ]);

        try {
            $this->payrollService->generatePayroll(
                $validated['user_id'],
                $validated['month'],
                $validated['year'],
                $validated['allowances'] ?? [],
                $validated['deductions'] ?? []
            );
            return redirect()->back()->with('success', 'Slip Gaji berhasil digenerate.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function bulkGenerate(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        try {
            $count = $this->payrollService->bulkGeneratePayroll(
                auth()->user()->tenant_id,
                $validated['month'],
                $validated['year']
            );
            return redirect()->back()->with('success', "{$count} Slip Gaji berhasil digenerate masal.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal Bulk Generate: ' . $e->getMessage());
        }
    }

    public function markAsPaid(Payroll $payroll)
    {
        try {
            $this->payrollService->markAsPaid($payroll);
            return redirect()->back()->with('success', 'Payroll berhasil ditandai sebagai dibayar.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function print(Payroll $payroll)
    {
        $payroll->load(['user', 'branch', 'items']);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payslip', compact('payroll'));
        
        $userName = $payroll->user ? $payroll->user->name : 'Karyawan';
        $filename = 'Slip_Gaji_' . str_replace(' ', '_', $userName) . '_' . date('F_Y', strtotime($payroll->period_start)) . '.pdf';
        
        return $pdf->stream($filename);
    }
}

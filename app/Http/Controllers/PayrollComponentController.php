<?php

namespace App\Http\Controllers;

use App\Models\PayrollComponent;
use App\Models\Tenants;
use App\Http\Requests\HRIS\StorePayrollComponentRequest;
use App\Http\Requests\HRIS\UpdatePayrollComponentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollComponentController extends Controller
{
    public function index(Request $request)
    {
        $query = PayrollComponent::orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', $request->type);
        }

        if (auth()->user()->isSuperAdmin() && $request->filled('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        $components = $query->paginate($request->get('per_page', 15));

        return Inertia::render('hris/payroll-components/Index', [
            'components' => $components,
            'filters' => $request->only(['search', 'type', 'tenant_id']),
            'tenants' => auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->orderBy('name')->get() : null,
            'is_super_admin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function store(StorePayrollComponentRequest $request)
    {
        $validated = $request->validated();

        if (auth()->user()->isSuperAdmin()) {
            $validated['tenant_id'] = $request->input('tenant_id');
        } else {
            $validated['tenant_id'] = auth()->user()->tenant_id;
        }
        
        $validated['is_taxable'] = $request->boolean('is_taxable', false);

        PayrollComponent::create($validated);

        return redirect()->back()->with('success', 'Komponen gaji berhasil ditambahkan.');
    }

    public function update(UpdatePayrollComponentRequest $request, PayrollComponent $payrollComponent)
    {
        $validated = $request->validated();

        $validated['is_taxable'] = $request->boolean('is_taxable', false);

        $payrollComponent->update($validated);

        return redirect()->back()->with('success', 'Komponen gaji berhasil diperbarui.');
    }

    public function destroy(PayrollComponent $payrollComponent)
    {
        $payrollComponent->delete();
        return redirect()->back()->with('success', 'Komponen gaji berhasil dihapus.');
    }
}

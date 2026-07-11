<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\CashAdvance;
use App\Models\CashBook;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashAdvanceController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;

        $query = CashAdvance::with(['user', 'creator'])
            ->where('tenant_id', $tenantId)
            ->latest('date');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $cashAdvances = $query->paginate(10)->withQueryString();

        $employees = User::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->select('id', 'name')
            ->get();

        return Inertia::render('hris/cash-advances/Index', [
            'cashAdvances' => $cashAdvances,
            'employees' => $employees,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branchId = auth()->user()->branch_id;

        DB::transaction(function () use ($request, $tenantId, $branchId) {
            $employee = User::findOrFail($request->user_id);

            $cashAdvance = CashAdvance::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'user_id' => $employee->id,
                'date' => $request->date,
                'amount' => $request->amount,
                'remaining_amount' => $request->amount,
                'reason' => $request->reason,
                'status' => 'approved',
                'created_by' => auth()->id(),
            ]);

            // Catat uang keluar dari laci kasir (BUKAN Beban, melainkan Piutang/Aset)
            CashBook::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'type' => 'out',
                'category' => 'Piutang Karyawan',
                'amount' => $request->amount,
                'reference_type' => 'CashAdvance',
                'reference_id' => $cashAdvance->id,
                'note' => "Kasbon Karyawan: {$employee->name} - {$request->reason}",
                'created_by' => auth()->id(),
                'created_at' => $request->date.' 12:00:00', // Ensure date aligns
            ]);
        });

        return back()->with('success', 'Kasbon berhasil dicatat dan uang keluar dari kas.');
    }

    public function destroy(CashAdvance $cashAdvance)
    {
        // Hanya bisa dihapus jika belum dipotong gaji (status = approved, remaining_amount == amount)
        if ($cashAdvance->status !== 'approved' || $cashAdvance->remaining_amount != $cashAdvance->amount) {
            return back()->with('error', 'Kasbon sudah diproses dalam penggajian dan tidak bisa dihapus.');
        }

        DB::transaction(function () use ($cashAdvance) {
            // Hapus arus kas terkait
            CashBook::where('tenant_id', $cashAdvance->tenant_id)
                ->where('reference_type', 'CashAdvance')
                ->where('reference_id', $cashAdvance->id)
                ->delete();

            $cashAdvance->delete();
        });

        return back()->with('success', 'Data kasbon berhasil dibatalkan.');
    }
}

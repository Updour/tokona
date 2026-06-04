<?php

namespace App\Http\Controllers;

use App\Http\Requests\Consignments\StoreConsignmentRequest;
use App\Http\Requests\Consignments\SettleConsignmentRequest;
use App\Services\ConsignmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Consignment;

class ConsignmentController extends Controller
{
    protected ConsignmentService $consignmentService;

    public function __construct(ConsignmentService $consignmentService)
    {
        $this->consignmentService = $consignmentService;
    }

    public function index(Request $request)
    {
        $data = $this->consignmentService->getListData($request->all());
        return Inertia::render('consignments/Index', $data);
    }

    public function store(StoreConsignmentRequest $request)
    {
        try {
            $this->consignmentService->receiveConsignment($request->validated());
            return redirect()->back()->with('success', 'Penerimaan barang titipan berhasil dicatat.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function update(string $id, Request $request)
    {
        $consignment = Consignment::findOrFail($id);

        // Security: pastikan hanya pemilik tenant yang bisa update
        if (!auth()->user()->isSuperAdmin() && $consignment->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        // Hanya consignment yang masih aktif yang bisa di-edit
        if ($consignment->status !== 'active') {
            return redirect()->back()->with('error', 'Titipan yang sudah diselesaikan tidak dapat diubah.');
        }

        $validated = $request->validate([
            'supplier_id'       => 'required|exists:suppliers,id',
            'branch_id'         => 'required|exists:branches,id',
            'notes'             => 'nullable|string|max:500',
            'consignment_date'  => 'required|date',
            'due_date'          => 'nullable|date|after_or_equal:consignment_date',
        ]);

        $consignment->update($validated);

        return redirect()->back()->with('success', 'Data titipan berhasil diperbarui.');
    }

    public function settle(string $id, SettleConsignmentRequest $request)
    {
        try {
            $this->consignmentService->settleConsignment($id, $request->validated());
            return redirect()->back()->with('success', 'Setoran barang titipan berhasil diselesaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function exportPdf(string $id)
    {
        $consignment = Consignment::with(['supplier', 'branch', 'items.product', 'tenant'])->findOrFail($id);

        // Security check
        if (auth()->check() && !auth()->user()->isSuperAdmin() && $consignment->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this resource.');
        }

        $pdf = Pdf::loadView('pdf.consignment_receipt', [
            'consignment' => $consignment
        ]);

        return $pdf->download('Tanda_Terima_Titipan_' . ($consignment->reference_number ?? $consignment->id) . '.pdf');
    }
}

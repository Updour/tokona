<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOpnameRequest;
use App\Models\Products;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\StockOpname;
use App\Imports\OpnameImportPreview;
use App\Imports\OpnameImport;
use Maatwebsite\Excel\Facades\Excel;

class OpnameController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Menampilkan halaman daftar riwayat Stock Opname
     */
    public function index(Request $request)
    {
        $opnames = $this->inventoryService->getOpnameHistory($request->all());

        // Fetch products for the new opname dialog
        $productsQuery = Products::withCurrentStock()->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $productsQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $products = $productsQuery->get();

        return Inertia::render('inventory/opname/Index', [
            'opnames' => $opnames,
            'products' => $products,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Menyimpan hasil stock opname baru dan menyesuaikan stok
     */
    public function store(StoreOpnameRequest $request)
    {
        try {
            $this->inventoryService->recordOpname($request->validated());

            return redirect()->back()->with('success', 'Stock Opname berhasil dicatat dan stok telah disesuaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Menyetujui draft opname
     */
    public function approve(string $id)
    {
        if (auth()->check() && !auth()->user()->isSuperAdmin() && !auth()->user()->isOwner() && !auth()->user()->hasPermission('inventory.opname.approve')) {
            abort(403, 'Anda tidak memiliki akses untuk menyetujui Stock Opname.');
        }

        try {
            $this->inventoryService->approveOpname($id);
            return redirect()->back()->with('success', 'Stock Opname berhasil disetujui dan stok telah disesuaikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Membatalkan draft opname
     */
    public function cancel(Request $request, string $id)
    {
        if (auth()->check() && !auth()->user()->isSuperAdmin() && !auth()->user()->isOwner() && !auth()->user()->hasPermission('inventory.opname.approve')) {
            abort(403, 'Anda tidak memiliki akses untuk membatalkan Stock Opname.');
        }

        $request->validate([
            'cancel_reason' => 'required|string|max:1000',
        ], [
            'cancel_reason.required' => 'Alasan pembatalan wajib diisi.',
        ]);

        try {
            $this->inventoryService->cancelOpname($id, $request->cancel_reason);
            return redirect()->back()->with('success', 'Stock Opname berhasil dibatalkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Export riwayat Stock Opname ke CSV
     */
    public function export(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 10000; // Ambil banyak data
        $opnames = $this->inventoryService->getOpnameHistory($filters);

        $callback = function () use ($opnames) {
            $file = fopen('php://output', 'w');

            // BOM untuk UTF-8 Excel
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, ['Tanggal', 'No Referensi', 'Auditor', 'Jumlah Item', 'Catatan']);

            foreach ($opnames->items() as $opname) {
                fputcsv($file, [
                    $opname->opname_date,
                    $opname->reference_number,
                    $opname->creator->name ?? '-',
                    $opname->items->count(),
                    $opname->notes ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->streamDownload($callback, 'riwayat_opname.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Download template Excel untuk Opname
     */
    public function downloadTemplate(Request $request)
    {
        $productsQuery = Products::withCurrentStock()->orderBy('name');
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $productsQuery->where('tenant_id', auth()->user()->tenant_id);
        }
        $products = $productsQuery->get();

        $callback = function () use ($products) {
            $file = fopen('php://output', 'w');

            // BOM untuk UTF-8 Excel
            fputs($file, "\xEF\xBB\xBF");

            // Menggunakan ; agar lebih ramah dengan Excel Indonesia, tapi fputcsv defaultnya ,
            // Kita gunakan ; sebagai delimiter
            fputcsv($file, ['sku', 'nama_produk', 'stok_sistem', 'stok_fisik', 'alasan_selisih'], ';');

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->sku,
                    $product->name,
                    $product->current_stock ?? 0,
                    '', // Stok fisik dikosongi
                    ''  // Alasan dikosongi
                ], ';');
            }

            fclose($file);
        };

        return response()->streamDownload($callback, 'template_opname.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function importPreview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $user = auth()->user();
        $tenantId = $user->tenant_id ?? \App\Models\Tenants::first()->id;

        $preview = new OpnameImportPreview($tenantId);
        Excel::import($preview, $request->file('file'));

        return response()->json([
            'valid_items' => $preview->validItems,
            'invalid_items' => $preview->invalidItems,
            'total_processed' => $preview->totalProcessed,
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
            'notes' => 'nullable|string',
            'opname_date' => 'required|date',
        ]);

        $user = auth()->user();
        $tenantId = $user->tenant_id ?? \App\Models\Tenants::first()->id;
        $branchId = $user->branch_id ?? \App\Models\Branch::where('tenant_id', $tenantId)->first()->id;

        $import = new OpnameImport($tenantId, $branchId, $request->notes, $request->opname_date);
        Excel::import($import, $request->file('file'));

        return back()->with('success', 'Berhasil mengimpor dan mencatat hasil Stock Opname massal.');
    }
}

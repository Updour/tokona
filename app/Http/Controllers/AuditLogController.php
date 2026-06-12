<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\SystemLog;
use App\Models\User;
use App\Models\Branch;
use App\Http\Requests\Audit\GetActivityLogsRequest;
use App\Http\Requests\Audit\GetSystemLogsRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    public function activityLogs(GetActivityLogsRequest $request): Response
    {
        $validated = $request->validated();
        $user = Auth::user();
        $query = ActivityLog::with([
            'user',
            'branch',
            'subject' => fn($q) => $q->withTrashed()
        ])->latest();

        // Tenant Isolation
        if (!$user->isSuperAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        // Filters
        if (!empty($validated['user_id']) && $validated['user_id'] !== 'all') {
            $query->where('user_id', $validated['user_id']);
        }
        if (!empty($validated['branch_id']) && $validated['branch_id'] !== 'all') {
            $query->where('branch_id', $validated['branch_id']);
        }
        if (!empty($validated['action']) && $validated['action'] !== 'all') {
            $query->where('action', 'like', "%{$validated['action']}%");
        }
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%");
            });
        }
        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }
        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $logs = $query->paginate(20)->withQueryString();

        $usersQuery = User::query();
        $branchesQuery = Branch::query();
        if (!$user->isSuperAdmin()) {
            $usersQuery->where('tenant_id', $user->tenant_id);
            $branchesQuery->where('tenant_id', $user->tenant_id);
        }

        return Inertia::render('audit/activity-logs/Index', [
            'logs' => $logs,
            'filters' => $validated,
            'users' => $usersQuery->select('id', 'name')->get(),
            'branches' => $branchesQuery->select('id', 'name')->get(),
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    public function systemLogs(GetSystemLogsRequest $request): Response
    {
        $validated = $request->validated();
        $user = Auth::user();

        $query = SystemLog::with(['user', 'tenant'])->latest();

        // Filters
        if (!empty($validated['level']) && $validated['level'] !== 'all') {
            $query->where('level', $validated['level']);
        }
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('exception_class', 'like', "%{$search}%");
            });
        }
        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }
        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('audit/system-logs/Index', [
            'logs' => $logs,
            'filters' => $validated,
        ]);
    }

    public function stockAudit(): Response
    {
        $user = Auth::user();

        // 1. Negative stock products
        $negativeStockQuery = \App\Models\Products::withCurrentStock()
            ->whereRaw('COALESCE(sm.current_stock, 0) < 0')
            ->with(['branch']);

        if (!$user->isSuperAdmin()) {
            $negativeStockQuery->where('products.tenant_id', $user->tenant_id);
        }
        $negativeStock = $negativeStockQuery->get();

        // 2. Branch transfer mismatches
        $mismatchedTransfersQuery = \App\Models\BranchTransfer::whereIn('status', ['RECEIVED', 'PARTIAL'])
            ->whereHas('items', function ($q) {
                $q->whereColumn('shipped_qty', '!=', 'received_qty');
            })
            ->with(['items.product', 'sourceBranch', 'destinationBranch']);

        if (!$user->isSuperAdmin()) {
            $mismatchedTransfersQuery->where('branch_transfers.tenant_id', $user->tenant_id);
        }
        $mismatchedTransfers = $mismatchedTransfersQuery->get();

        // 3. Unmatched products (track stock but no movements)
        $unmatchedProductsQuery = \App\Models\Products::where('track_stock', true)
            ->doesntHave('stockMovements')
            ->with(['branch']);

        if (!$user->isSuperAdmin()) {
            $unmatchedProductsQuery->where('products.tenant_id', $user->tenant_id);
        }
        $unmatchedProducts = $unmatchedProductsQuery->get();

        return Inertia::render('audit/stock-anomalies/Index', [
            'negativeStock' => $negativeStock,
            'mismatchedTransfers' => $mismatchedTransfers,
            'unmatchedProducts' => $unmatchedProducts,
        ]);
    }

    public function resolveNegativeStock(string $productId): \Illuminate\Http\RedirectResponse
    {
        $product = \App\Models\Products::withCurrentStock()->findOrFail($productId);
        $currentStock = (int) $product->current_stock;

        if ($currentStock < 0) {
            $adjustQty = abs($currentStock);
            $product->recordStockMovement('ADJUST', $adjustQty, [
                'branch_id' => $product->branch_id,
                'source_type' => 'manual',
                'notes' => 'Penyelarasan otomatis untuk stok negatif (sistem audit)',
            ]);

            \App\Services\ActivityLogger::log(
                'Ubah Data Penting',
                "Penyelarasan otomatis stok negatif produk {$product->name} (dari {$currentStock} ke 0)",
                $product,
                ['product_name' => $product->name, 'previous_stock' => $currentStock]
            );
        }

        return redirect()->back()->with('success', 'Stok negatif berhasil diselaraskan menjadi 0.');
    }

    public function resolveTransferMismatch(string $transferId): \Illuminate\Http\RedirectResponse
    {
        $transfer = \App\Models\BranchTransfer::with('items')->findOrFail($transferId);

        \Illuminate\Support\Facades\DB::transaction(function () use ($transfer) {
            foreach ($transfer->items as $item) {
                $diff = $item->shipped_qty - $item->received_qty;

                if ($diff > 0) {
                    $item->update([
                        'received_qty' => $item->shipped_qty,
                    ]);

                    $product = \App\Models\Products::find($item->product_id);
                    if ($product) {
                        $product->recordStockMovement('IN', $diff, [
                            'branch_id' => $transfer->destination_branch_id,
                            'source_type' => 'branch_transfer',
                            'notes' => "Penyelarasan otomatis selisih transfer ({$transfer->reference_number})",
                        ]);
                    }
                } elseif ($diff < 0) {
                    $item->update([
                        'received_qty' => $item->shipped_qty,
                    ]);

                    $product = \App\Models\Products::find($item->product_id);
                    if ($product) {
                        $product->recordStockMovement('OUT', abs($diff), [
                            'branch_id' => $transfer->destination_branch_id,
                            'source_type' => 'branch_transfer',
                            'notes' => "Penyelarasan otomatis selisih transfer ({$transfer->reference_number})",
                        ]);
                    }
                }
            }

            $transfer->update([
                'status' => 'RECEIVED',
                'received_at' => now(),
            ]);

            \App\Services\ActivityLogger::log(
                'Ubah Data Penting',
                "Penyelarasan otomatis selisih transfer cabang {$transfer->reference_number}",
                $transfer,
                ['reference_number' => $transfer->reference_number]
            );
        });

        return redirect()->back()->with('success', 'Selisih transfer cabang berhasil diselaraskan.');
    }
}

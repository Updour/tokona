<?php

namespace App\Http\Controllers;

use App\Http\Requests\Audit\GetActivityLogsRequest;
use App\Http\Requests\Audit\GetSystemLogsRequest;
use App\Models\ActivityLog;
use App\Models\Branch;
use App\Models\BranchTransfer;
use App\Models\Products;
use App\Models\SystemLog;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function activityLogs(GetActivityLogsRequest $request): Response
    {
        $validated = $request->validated();
        $user = Auth::user();
        $query = ActivityLog::with([
            'user',
            'branch',
            'subject' => fn($q) => $q->withTrashed(),
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

        $perPage = request('per_page', 15);
        $logs = $query->paginate($perPage)->withQueryString();

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

        $perPage = request('per_page', 15);
        $logs = $query->paginate($perPage)->withQueryString();

        return Inertia::render('audit/system-logs/Index', [
            'logs' => $logs,
            'filters' => $validated,
        ]);
    }

    public function stockAudit(): Response
    {
        $user = Auth::user();

        // 1. Negative stock products
        $negativeStockQuery = Products::withCurrentStock()
            ->whereRaw('COALESCE(sm.current_stock, 0) < 0')
            ->with(['branch']);

        if (!$user->isSuperAdmin()) {
            $negativeStockQuery->where('products.tenant_id', $user->tenant_id);
        }
        $negativeStock = $negativeStockQuery->get();

        // 2. Branch transfer mismatches
        $mismatchedTransfersQuery = BranchTransfer::whereIn('status', ['RECEIVED', 'PARTIAL'])
            ->whereHas('items', function ($q) {
                $q->whereColumn('shipped_qty', '!=', 'received_qty');
            })
            ->with(['items.product', 'sourceBranch', 'destinationBranch']);

        if (!$user->isSuperAdmin()) {
            $mismatchedTransfersQuery->where('branch_transfers.tenant_id', $user->tenant_id);
        }
        $mismatchedTransfers = $mismatchedTransfersQuery->get();

        // 3. Unmatched products (track stock but no movements)
        $unmatchedProductsQuery = Products::where('track_stock', true)
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

    public function resolveNegativeStock(string $productId): RedirectResponse
    {
        $product = Products::withCurrentStock()->findOrFail($productId);
        $currentStock = (int) $product->current_stock;

        if ($currentStock < 0) {
            $adjustQty = abs($currentStock);
            $product->recordStockMovement('ADJUST', $adjustQty, [
                'branch_id' => $product->branch_id,
                'source_type' => 'manual',
                'notes' => 'Penyelarasan otomatis untuk stok negatif (sistem audit)',
            ]);

            ActivityLogger::log(
                'Ubah Data Penting',
                "Penyelarasan otomatis stok negatif produk {$product->name} (dari {$currentStock} ke 0)",
                $product,
                ['product_name' => $product->name, 'previous_stock' => $currentStock]
            );
        }

        return redirect()->back()->with('success', 'Stok negatif berhasil diselaraskan menjadi 0.');
    }

    public function resolveTransferMismatch(string $transferId): RedirectResponse
    {
        $transfer = BranchTransfer::with('items')->findOrFail($transferId);

        DB::transaction(function () use ($transfer) {
            foreach ($transfer->items as $item) {
                $diff = $item->shipped_qty - $item->received_qty;

                if ($diff > 0) {
                    $item->update([
                        'received_qty' => $item->shipped_qty,
                    ]);

                    $sourceProduct = Products::find($item->product_id);
                    if ($sourceProduct) {
                        $destProduct = Products::where('branch_id', $transfer->destination_branch_id)
                            ->where(function ($q) use ($sourceProduct) {
                                if (!empty($sourceProduct->sku)) {
                                    $q->where('sku', $sourceProduct->sku);
                                } elseif (!empty($sourceProduct->barcode)) {
                                    $q->where('barcode', $sourceProduct->barcode);
                                } else {
                                    $q->where('name', $sourceProduct->name);
                                }
                            })->first();

                        if (!$destProduct) {
                            $destProduct = Products::create([
                                'tenant_id' => $transfer->tenant_id,
                                'branch_id' => $transfer->destination_branch_id,
                                'name' => $sourceProduct->name,
                                'sku' => $sourceProduct->sku,
                                'barcode' => $sourceProduct->barcode,
                                'description' => $sourceProduct->description,
                                'base_cost' => $sourceProduct->base_cost,
                                'sell_price' => $sourceProduct->sell_price,
                                'min_sell_price' => $sourceProduct->min_sell_price,
                                'track_stock' => $sourceProduct->track_stock,
                                'is_active' => $sourceProduct->is_active,
                                'category_id' => $sourceProduct->category_id,
                                'type_id' => $sourceProduct->type_id,
                                'source' => $sourceProduct->source,
                            ]);
                        }

                        $destProduct->recordStockMovement('IN', $diff, [
                            'branch_id' => $transfer->destination_branch_id,
                            'source_type' => 'branch_transfer',
                            'notes' => "Penyelarasan otomatis selisih transfer ({$transfer->reference_number})",
                        ]);
                    }
                } elseif ($diff < 0) {
                    $item->update([
                        'received_qty' => $item->shipped_qty,
                    ]);

                    $sourceProduct = Products::find($item->product_id);
                    if ($sourceProduct) {
                        $destProduct = Products::where('branch_id', $transfer->destination_branch_id)
                            ->where(function ($q) use ($sourceProduct) {
                                if (!empty($sourceProduct->sku)) {
                                    $q->where('sku', $sourceProduct->sku);
                                } elseif (!empty($sourceProduct->barcode)) {
                                    $q->where('barcode', $sourceProduct->barcode);
                                } else {
                                    $q->where('name', $sourceProduct->name);
                                }
                            })->first();

                        if ($destProduct) {
                            $destProduct->recordStockMovement('OUT', abs($diff), [
                                'branch_id' => $transfer->destination_branch_id,
                                'source_type' => 'branch_transfer',
                                'notes' => "Penyelarasan otomatis selisih transfer ({$transfer->reference_number})",
                            ]);
                        }
                    }
                }
            }

            $transfer->update([
                'status' => 'RECEIVED',
                'received_at' => now(),
            ]);

            ActivityLogger::log(
                'Ubah Data Penting',
                "Penyelarasan otomatis selisih transfer cabang {$transfer->reference_number}",
                $transfer,
                ['reference_number' => $transfer->reference_number]
            );
        });

        return redirect()->back()->with('success', 'Selisih transfer cabang berhasil diselaraskan.');
    }
}

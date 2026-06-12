<?php

namespace App\Services;

use App\Models\Products;
use App\Models\TransactionItem;
use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InsightService
{
    /**
     * Get Inventory Forecasting (AI Smart Insights)
     * Menghitung kecepatan penjualan dan sisa usia stok gudang.
     */
    public function getInventoryForecast(string $branchId = null): array
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? Branch::first()->tenant_id;
        
        $branchId = $branchId ?? $user->branch_id;
        if (!$branchId) {
            $branchId = Branch::first()->id;
        }

        $daysToAnalyze = 30;
        $startDate = Carbon::now()->subDays($daysToAnalyze)->startOfDay();

        // Ambil produk yang dilacak stoknya saja
        $products = Products::where('tenant_id', $tenantId)
            ->where('track_stock', true)
            ->get();

        // Ambil total penjualan per produk dalam 30 hari terakhir
        $salesData = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.branch_id', $branchId)
            ->where('transactions.status', '!=', 'cancel')
            ->where('transactions.created_at', '>=', $startDate)
            ->select('transaction_items.product_id', DB::raw('SUM(transaction_items.qty) as total_sold'))
            ->groupBy('transaction_items.product_id')
            ->pluck('total_sold', 'product_id')
            ->toArray();

        $insights = [];

        foreach ($products as $product) {
            $totalSold = $salesData[$product->id] ?? 0;
            
            // Velocity = Rata-rata barang terjual per hari
            $velocity = $totalSold / $daysToAnalyze;
            
            // Days Remaining = Sisa hari sampai stok habis berdasarkan velocity saat ini
            $daysRemaining = $velocity > 0 ? floor($product->current_stock / $velocity) : 999;
            
            // Rekomendasi Restock = Kebutuhan stok untuk 30 hari ke depan
            $recommendedRestock = ceil($velocity * 30);

            // Klasifikasi Status
            if ($product->current_stock <= 0) {
                $status = 'Out of Stock';
                $urgency = 'critical';
            } elseif ($daysRemaining <= 7) {
                $status = 'Needs Restock (≤ 7 Days)';
                $urgency = 'high';
            } elseif ($daysRemaining <= 14) {
                $status = 'Monitor Stock (≤ 14 Days)';
                $urgency = 'medium';
            } else {
                $status = 'Healthy Stock';
                $urgency = 'low';
            }

            $insights[] = [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'current_stock' => $product->current_stock,
                'total_sold_30d' => (int) $totalSold,
                'velocity_per_day' => round($velocity, 2),
                'days_remaining' => (int) $daysRemaining,
                'recommended_restock' => (int) $recommendedRestock,
                'status' => $status,
                'urgency' => $urgency
            ];
        }

        // Urutkan berdasarkan urgency: critical -> high -> medium -> low
        usort($insights, function ($a, $b) {
            $order = ['critical' => 1, 'high' => 2, 'medium' => 3, 'low' => 4];
            return $order[$a['urgency']] <=> $order[$b['urgency']];
        });

        // Filter out low urgency by default unless we want full list, but let's return all and let frontend filter
        return $insights;
    }
}

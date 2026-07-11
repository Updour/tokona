<?php

namespace App\Services;

use App\Models\Products;
use App\Models\Purchase;
use App\Models\Transaction;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Get all unread alerts for the current tenant.
     * Includes Payables (Purchases), Receivables (Transactions), and Low Stock products.
     */
    public function getUnreadAlerts(): array
    {
        if (! auth()->check()) {
            return [];
        }

        $alerts = [];
        $dueDateThreshold = Carbon::now()->addDays(7);
        $today = Carbon::today();

        // 1. Hutang ke Supplier (Payables)
        // Purchases that are not fully paid and due within 7 days
        $payables = Purchase::with('supplier')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('due_date', '<=', $dueDateThreshold)
            ->orderBy('due_date', 'asc')
            ->get();

        foreach ($payables as $payable) {
            $isOverdue = Carbon::parse($payable->due_date)->startOfDay()->lt($today);
            $daysDiff = $today->diffInDays(Carbon::parse($payable->due_date)->startOfDay(), false);

            $timeText = $isOverdue ? 'Telah lewat '.abs($daysDiff).' hari' : ($daysDiff == 0 ? 'Jatuh tempo hari ini' : 'Jatuh tempo dalam '.$daysDiff.' hari');

            $alerts[] = [
                'id' => 'payable_'.$payable->id,
                'type' => 'payable',
                'title' => 'Hutang Supplier Jatuh Tempo',
                'message' => "PO {$payable->invoice_number} ke {$payable->supplier->name}. {$timeText}.",
                'action_url' => "/purchases/{$payable->id}",
                'is_urgent' => $isOverdue || $daysDiff <= 1,
                'created_at' => $payable->created_at->toIso8601String(),
                'time_text' => $timeText,
            ];
        }

        // 2. Piutang Pelanggan (Receivables)
        // Transactions that are not fully paid and due within 7 days
        $receivables = Transaction::with('customer')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('due_date', '<=', $dueDateThreshold)
            ->orderBy('due_date', 'asc')
            ->get();

        foreach ($receivables as $receivable) {
            $isOverdue = Carbon::parse($receivable->due_date)->startOfDay()->lt($today);
            $daysDiff = $today->diffInDays(Carbon::parse($receivable->due_date)->startOfDay(), false);

            $timeText = $isOverdue ? 'Telah lewat '.abs($daysDiff).' hari' : ($daysDiff == 0 ? 'Jatuh tempo hari ini' : 'Jatuh tempo dalam '.$daysDiff.' hari');
            $customerName = $receivable->customer ? $receivable->customer->name : 'Pelanggan';

            $alerts[] = [
                'id' => 'receivable_'.$receivable->id,
                'type' => 'receivable',
                'title' => 'Piutang Pelanggan Jatuh Tempo',
                'message' => "Tagihan {$receivable->invoice_number} a/n {$customerName}. {$timeText}.",
                'action_url' => "/finance/debts-receivables",
                'is_urgent' => $isOverdue || $daysDiff <= 1,
                'created_at' => $receivable->created_at->toIso8601String(),
                'time_text' => $timeText,
            ];
        }

        // 3. Low Stock Alerts
        $lowStocks = Products::withCurrentStock()
            ->lowStock()
            ->orderBy('name', 'asc')
            ->limit(20) // Batasi agar tidak terlalu banyak notifikasi
            ->get();

        foreach ($lowStocks as $product) {
            $alerts[] = [
                'id' => 'lowstock_'.$product->id,
                'type' => 'low_stock',
                'title' => 'Stok Barang Menipis',
                'message' => "Sisa stok {$product->name} tinggal {$product->current_stock} {$product->unit} (Batas min: {$product->min_stock}).",
                'action_url' => "/inventory/low-stock",
                'is_urgent' => false,
                'created_at' => Carbon::now()->toIso8601String(),
                'time_text' => 'Stok Menipis',
            ];
        }

        return $alerts;
    }
}

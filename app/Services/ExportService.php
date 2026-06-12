<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Branch;
use App\Exports\TransactionsExport;
use App\Exports\SalesReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportService
{
    // =========================================================================
    // Excel Exports
    // =========================================================================

    public function exportTransactionsToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'daftar-transaksi-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new TransactionsExport($filters), $filename);
    }

    public function exportSalesReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-penjualan-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new SalesReportExport($filters), $filename);
    }

    public function exportProductReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-performa-produk-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new \App\Exports\ProductPerformanceExport($filters), $filename);
    }

    public function exportStockReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-valuasi-stok-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new \App\Exports\StockValuationExport($filters), $filename);
    }

    public function exportSalesFieldReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-sales-lapangan-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new \App\Exports\SalesFieldExport($filters), $filename);
    }

    public function exportInventoryToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'riwayat-mutasi-stok-' . now()->format('YmdHis') . '.xlsx';
        return Excel::download(new \App\Exports\InventoryExport($filters), $filename);
    }

    // =========================================================================
    // PDF Exports
    // =========================================================================

    public function exportTransactionsToPdf(array $filters)
    {
        $query = Transaction::with(['customer', 'creator', 'branch']);
        $query->filter($filters);
        $transactions = $query->orderByDesc('created_at')->get();

        $totalAmount = $transactions->sum('total');

        $html = view('exports.transactions-pdf', [
            'transactions' => $transactions,
            'filters'      => $filters,
            'totalAmount'  => $totalAmount,
            'branchName'   => auth()->user()->branch?->name ?? 'Semua Cabang',
            'generatedAt'  => now()->format('d-m-Y H:i:s'),
        ])->render();

        $pdf = Pdf::loadHTML($html);
        return $pdf->download('daftar-transaksi-' . now()->format('YmdHis') . '.pdf');
    }

    public function exportInvoiceToPdf(Transaction $transaction)
    {
        $transaction->load(['items.product', 'customer', 'creator', 'branch']);

        $html = view('exports.invoice-pdf', [
            'transaction' => $transaction,
            'generatedAt' => now()->format('d-m-Y H:i:s'),
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $safeInvoiceNumber = str_replace(['/', '\\'], '-', $transaction->invoice_number);
        return $pdf->download('invoice-' . $safeInvoiceNumber . '.pdf');
    }
}

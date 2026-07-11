<?php

namespace App\Services;

use App\Exports\InventoryExport;
use App\Exports\ProductPerformanceExport;
use App\Exports\SalesFieldExport;
use App\Exports\SalesReportExport;
use App\Exports\StockValuationExport;
use App\Exports\TransactionsExport;
use App\Exports\CustomersExport;
use App\Exports\ConsignmentExport;
use App\Models\BranchTransfer;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportService
{
    // =========================================================================
    // Excel Exports
    // =========================================================================

    public function exportTransactionsToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'daftar-transaksi-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new TransactionsExport($filters), $filename);
    }

    public function exportSalesReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-penjualan-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new SalesReportExport($filters), $filename);
    }

    public function exportProductReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-performa-produk-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new ProductPerformanceExport($filters), $filename);
    }

    public function exportStockReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-valuasi-stok-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new StockValuationExport($filters), $filename);
    }

    public function exportSalesFieldReportToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'laporan-sales-lapangan-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new SalesFieldExport($filters), $filename);
    }

    public function exportInventoryToExcel(array $filters): BinaryFileResponse
    {
        $filename = 'riwayat-mutasi-stok-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new InventoryExport($filters), $filename);
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
            'filters' => $filters,
            'totalAmount' => $totalAmount,
            'branchName' => auth()->user()->branch?->name ?? 'Semua Cabang',
            'generatedAt' => now()->format('d-m-Y H:i:s'),
        ])->render();

        $pdf = Pdf::loadHTML($html);

        return $pdf->download('daftar-transaksi-'.now()->format('YmdHis').'.pdf');
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

        return $pdf->download('invoice-'.$safeInvoiceNumber.'.pdf');
    }

    public function exportDeliveryNoteToPdf(BranchTransfer $transfer)
    {
        $transfer->load(['items.product', 'sourceBranch', 'destinationBranch', 'creator', 'receiver']);

        $html = view('exports.delivery-note-pdf', [
            'transfer' => $transfer,
            'generatedAt' => now()->format('d-m-Y H:i:s'),
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $safeRefNumber = str_replace(['/', '\\'], '-', $transfer->reference_number);

        return $pdf->download('surat-jalan-'.$safeRefNumber.'.pdf');
    }

    public function exportCustomersToExcel(array $filters)
    {
        $filename = 'daftar-pelanggan-'.now()->format('YmdHis').'.xlsx';
        return Excel::download(new CustomersExport($filters), $filename);
    }

    public function exportConsignmentsToExcel(array $filters)
    {
        $filename = 'rekap-barang-titipan-'.now()->format('YmdHis').'.xlsx';
        return Excel::download(new ConsignmentExport($filters), $filename);
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\ExportService;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function __construct(
        private readonly ExportService $exportService
    ) {}

    public function transactions(Request $request)
    {
        $format = $request->query('format', 'excel');

        if ($format === 'pdf') {
            return $this->exportService->exportTransactionsToPdf($request->all());
        }

        return $this->exportService->exportTransactionsToExcel($request->all());
    }

    public function salesReport(Request $request)
    {
        return $this->exportService->exportSalesReportToExcel($request->all());
    }

    public function productReport(Request $request)
    {
        return $this->exportService->exportProductReportToExcel($request->all());
    }

    public function stockReport(Request $request)
    {
        return $this->exportService->exportStockReportToExcel($request->all());
    }

    public function salesFieldReport(Request $request)
    {
        return $this->exportService->exportSalesFieldReportToExcel($request->all());
    }

    public function inventory(Request $request)
    {
        return $this->exportService->exportInventoryToExcel($request->all());
    }

    public function invoice(Transaction $transaction)
    {
        return $this->exportService->exportInvoiceToPdf($transaction);
    }
}

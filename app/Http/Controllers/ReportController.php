<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Http\Requests\Reports\ReportFilterRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected ReportService $reportService;

    /**
     * Injeksi dependensi ReportService ke Controller
     */
    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Merender Dashboard Laporan Terpadu (Sales, Products, & Stocks)
     */
    public function index(ReportFilterRequest $request): Response
    {
        $data = $this->reportService->getReportsData($request->all());
        
        return Inertia::render('reports/Index', $data);
    }
}

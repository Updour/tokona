<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Services\InsightService;
use App\Http\Requests\Reports\ReportFilterRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected ReportService $reportService;
    protected InsightService $insightService;

    /**
     * Injeksi dependensi ReportService & InsightService ke Controller
     */
    public function __construct(ReportService $reportService, InsightService $insightService)
    {
        $this->reportService = $reportService;
        $this->insightService = $insightService;
    }

    /**
     * Merender Dashboard Laporan Terpadu (Sales, Products, & Stocks)
     */
    public function index(ReportFilterRequest $request): Response
    {
        $data = $this->reportService->getReportsData($request->all());
        $data['smartInsights'] = $this->insightService->getInventoryForecast($request->input('branch_id'));
        
        return Inertia::render('reports/Index', $data);
    }
}

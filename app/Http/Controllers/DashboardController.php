<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(Request $request): Response
    {
        $data = $this->reportService->getReportsData($request->all());
        return Inertia::render('dashboard/index', $data);
    }

    public function sales(Request $request): Response
    {
        $data = $this->reportService->getSalesDashboardData($request->all());
        return Inertia::render('dashboard/sales', $data);
    }
}

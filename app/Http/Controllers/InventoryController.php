<?php

namespace App\Http\Controllers;

use App\Services\Products\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        private readonly ProductService $productService
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('inventory/index', (new \App\Queries\InventoryQuery($request))->indexData());
    }

    public function lowStock(Request $request): Response
    {
        $data = $this->productService->getLowStockData($request->all());
        return Inertia::render('inventory/low-stock', $data);
    }
}

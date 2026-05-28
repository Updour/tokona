<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('inventory/index', (new \App\Queries\InventoryQuery($request))->indexData());
    }
}

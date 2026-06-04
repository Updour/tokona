<?php

namespace App\Http\Controllers;

use App\Http\Requests\Shifts\CloseShiftRequest;
use App\Http\Requests\Shifts\OpenShiftRequest;
use App\Models\CashRegisterShift;
use App\Services\ShiftService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function __construct(
        private readonly ShiftService $shiftService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->shiftService->getShiftListData($request->all());
        return Inertia::render('shifts/index', $data);
    }

    public function open(OpenShiftRequest $request): RedirectResponse
    {
        try {
            $this->shiftService->openShift($request->validated());
            return redirect()->back()->with('success', 'Shift berhasil dibuka. Selamat bekerja!');
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function close(CloseShiftRequest $request, CashRegisterShift $shift): RedirectResponse
    {
        $this->shiftService->closeShift($shift, $request->validated());
        return redirect()->route('shifts.index')->with('success', 'Shift berhasil ditutup.');
    }

    public function show(CashRegisterShift $shift): Response
    {
        $data = $this->shiftService->getShiftSummary($shift);
        return Inertia::render('shifts/show', $data);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\Attendances\ClockInRequest;
use App\Http\Requests\Attendances\ClockOutRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendanceService)
    {
    }

    public function index(Request $request): Response
    {
        $data = $this->attendanceService->getAttendanceListData($request->all());
        return Inertia::render('attendances/index', $data);
    }

    public function clockIn(ClockInRequest $request)
    {
        try {
            $this->attendanceService->clockIn($request->validated());
            return back()->with('success', 'Absensi masuk berhasil dicatat.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function clockOut(ClockOutRequest $request)
    {
        try {
            $this->attendanceService->clockOut($request->validated());
            return back()->with('success', 'Absensi pulang berhasil dicatat.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        return $this->attendanceService->exportCsv($request->all());
    }
}

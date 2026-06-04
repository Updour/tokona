<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Exception;

class AttendanceService
{
    /**
     * Get attendance list data with pagination and filters
     */
    public function getAttendanceListData(array $filters): array
    {
        $attendances = Attendance::with(['user', 'branch'])
            ->filter($filters)
            ->latest('date')
            ->latest('check_in_time')
            ->paginate($filters['per_page'] ?? 15);

        // Stats for the current view (all branches or specific branch)
        $statsQuery = Attendance::filter($filters);
        
        $stats = [
            'total_present' => (clone $statsQuery)->where('status', 'present')->count(),
            'total_late' => (clone $statsQuery)->where('status', 'late')->count(),
            'total_sick' => (clone $statsQuery)->where('status', 'sick')->count(),
            'total_leave' => (clone $statsQuery)->where('status', 'leave')->count(),
            'total_absent' => (clone $statsQuery)->where('status', 'absent')->count(),
        ];

        return [
            'attendances' => $attendances,
            'stats' => $stats,
            'branches' => Branch::orderBy('name')->get(['id', 'name', 'code']),
            'filters' => $filters,
        ];
    }

    /**
     * Clock in logic
     */
    public function clockIn(array $data)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        // Check if already clocked in today
        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            throw new Exception('Anda sudah melakukan absensi masuk hari ini.');
        }

        $now = Carbon::now();
        
        // Determine if late (standard check-in time is 08:15 AM)
        $standardInTime = Carbon::today()->setHour(8)->setMinute(15); 
        $status = $now->greaterThan($standardInTime) ? 'late' : 'present';

        // Override status if specified (e.g. sick, leave)
        if (isset($data['type']) && in_array($data['type'], ['sick', 'leave'])) {
            $status = $data['type'];
        }

        $branchId = $data['branch_id'] ?? $user->branch_id;
        $tenantId = $user->tenant_id;

        if (!$tenantId && $branchId) {
            $branch = Branch::find($branchId);
            if ($branch) {
                $tenantId = $branch->tenant_id;
            }
        }

        if (!$tenantId) {
            throw new Exception('Gagal melakukan absensi: Tidak dapat menentukan tenant/toko aktif.');
        }

        return Attendance::create([
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'branch_id' => $branchId,
            'date' => $today,
            'check_in_time' => $now,
            'status' => $status,
            'notes' => $data['notes'] ?? null,
            'lat_in' => $data['latitude'] ?? null,
            'lng_in' => $data['longitude'] ?? null,
        ]);
    }

    /**
     * Clock out logic
     */
    public function clockOut(array $data)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            throw new Exception('Anda belum melakukan absen masuk hari ini.');
        }

        if ($attendance->check_out_time) {
            throw new Exception('Anda sudah melakukan absen pulang.');
        }

        $attendance->update([
            'check_out_time' => Carbon::now(),
            'lat_out' => $data['latitude'] ?? null,
            'lng_out' => $data['longitude'] ?? null,
        ]);

        return $attendance;
    }

    /**
     * Export attendance data to CSV
     */
    public function exportCsv(array $filters)
    {
        $attendances = Attendance::with(['user', 'branch'])
            ->filter($filters)
            ->latest('date')
            ->latest('check_in_time')
            ->get();

        $filename = 'Laporan_Absensi_' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($attendances) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fputs($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            
            // Header
            fputcsv($file, [
                'Tanggal',
                'Nama Pegawai',
                'Cabang',
                'Jam Masuk',
                'Jam Pulang',
                'Status',
                'Catatan'
            ]);

            foreach ($attendances as $row) {
                $statusMap = [
                    'present' => 'Hadir',
                    'late' => 'Terlambat',
                    'sick' => 'Sakit',
                    'leave' => 'Cuti / Izin',
                    'absent' => 'Alpha',
                ];

                fputcsv($file, [
                    $row->date,
                    $row->user?->name ?? '-',
                    $row->branch?->name ?? '-',
                    $row->check_in_time ? Carbon::parse($row->check_in_time)->format('H:i') : '-',
                    $row->check_out_time ? Carbon::parse($row->check_out_time)->format('H:i') : '-',
                    $statusMap[$row->status] ?? $row->status,
                    $row->notes ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

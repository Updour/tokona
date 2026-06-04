<?php

namespace App\Exports;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesReportExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $startDate = $this->filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $this->filters['end_date'] ?? now()->toDateString();
        $branchId = $this->filters['branch_id'] ?? 'ALL';

        $query = Transaction::where('status', 'paid')
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);

        if ($branchId !== 'ALL') {
            $query->where('branch_id', $branchId);
        }

        $dailySales = $query
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as tx_count'),
                DB::raw('SUM(subtotal) as total_subtotal'),
                DB::raw('SUM(discount) as total_discount'),
                DB::raw('SUM(tax) as total_tax'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get();

        return $dailySales->map(function ($row) {
            return [
                $row->date,
                $row->tx_count,
                (float) $row->total_subtotal,
                (float) $row->total_discount,
                (float) $row->total_tax,
                (float) $row->total_revenue,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Jumlah Transaksi',
            'Total Subtotal',
            'Total Diskon',
            'Total Pajak',
            'Total Pendapatan',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

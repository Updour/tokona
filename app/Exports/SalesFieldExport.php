<?php

namespace App\Exports;

use App\Models\SalesPerson;
use App\Models\SalesVisit;
use App\Models\SalesOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesFieldExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
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

        $query = SalesPerson::with('branch')->orderBy('name');
        
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        if ($branchId !== 'ALL') {
            $query->where('branch_id', $branchId);
        }

        return $query->get()->map(function ($s) use ($startDate, $endDate) {
            $visits = SalesVisit::where('sales_id', $s->id)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            $orders = SalesOrder::whereHas('salesVisit', function ($q) use ($s, $startDate, $endDate) {
                $q->where('sales_id', $s->id)
                  ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            });

            $ordersCount = $orders->count();
            $totalRevenue = (float) $orders->sum('total_amount');
            $conversion = $visits > 0 ? round($ordersCount / $visits * 100, 1) : 0;

            return [
                $s->name,
                $s->branch?->name ?? '-',
                $visits,
                $ordersCount,
                $conversion . '%',
                $totalRevenue
            ];
        })->sortByDesc(fn($item) => $item[5])->values(); // sort by totalRevenue
    }

    public function headings(): array
    {
        return [
            'Nama Sales',
            'Cabang',
            'Total Kunjungan / Visits',
            'Total Konversi Order',
            'Tingkat Konversi (%)',
            'Total Omset Jual (IDR)'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

<?php

namespace App\Exports;

use App\Models\Consignment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ConsignmentExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Consignment::with(['supplier', 'branch']);
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'ALL') {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['supplier_id']) && $this->filters['supplier_id'] !== 'ALL') {
            $query->where('supplier_id', $this->filters['supplier_id']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('consignment_date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('consignment_date', '<=', $this->filters['date_to']);
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'ID Sesi',
            'Supplier',
            'Cabang',
            'Tanggal Titip',
            'Batas Waktu (Due Date)',
            'Status',
            'Total Nilai Bayar',
            'Diskon',
            'Bersih Dibayar',
            'Catatan',
        ];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->supplier?->name ?? '-',
            $row->branch?->name ?? '-',
            $row->consignment_date,
            $row->due_date ?? '-',
            strtoupper($row->status),
            (float) $row->total_paid,
            (float) $row->total_discount,
            (float) ($row->total_paid - $row->total_discount),
            $row->notes ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

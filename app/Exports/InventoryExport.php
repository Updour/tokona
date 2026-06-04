<?php

namespace App\Exports;

use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = StockMovement::with(['product:id,name,sku,barcode', 'branch:id,name']);

        // Filter tenant if not super admin
        if (!auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        // Apply Search
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Apply Type Filter
        if (!empty($this->filters['type']) && $this->filters['type'] !== 'ALL') {
            $query->where('type', $this->filters['type']);
        }

        // Apply Branch Filter
        if (!empty($this->filters['branch_id']) && $this->filters['branch_id'] !== 'ALL') {
            $query->where('branch_id', $this->filters['branch_id']);
        }

        // Apply Date Filters
        if (!empty($this->filters['start_date'])) {
            $query->whereDate('created_at', '>=', $this->filters['start_date']);
        }
        if (!empty($this->filters['end_date'])) {
            $query->whereDate('created_at', '<=', $this->filters['end_date']);
        }

        $movements = $query->orderBy('created_at', 'desc')->get();

        return $movements->map(function ($row) {
            $typeText = match ($row->type) {
                'IN' => 'Stok Masuk',
                'OUT' => 'Stok Keluar',
                'RETURN' => 'Retur',
                'ADJUST' => 'Opname (Adjust)',
                default => $row->type,
            };

            return [
                $row->created_at->format('d-m-Y H:i'),
                $row->product?->name ?? '-',
                $row->product?->sku ?? '-',
                $row->product?->barcode ?? '-',
                $row->branch?->name ?? 'Gudang Utama',
                $typeText,
                (int) $row->qty,
                $row->source_type ?? '-',
                $row->description ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Waktu',
            'Nama Produk',
            'SKU',
            'Barcode',
            'Cabang/Gudang',
            'Tipe Pergerakan',
            'Kuantitas (Qty)',
            'Sumber',
            'Keterangan',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

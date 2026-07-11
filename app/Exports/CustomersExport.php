<?php

namespace App\Exports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Customer::query();
        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        return $query->orderBy('name');
    }

    public function headings(): array
    {
        return [
            'ID Pelanggan',
            'Nama Pelanggan',
            'Telepon',
            'Email',
            'Alamat',
            'Poin Member',
            'Tingkatan (Tier)',
            'Hutang',
            'Tanggal Terdaftar',
        ];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->name,
            $row->phone ?? '-',
            $row->email ?? '-',
            $row->address ?? '-',
            (int) $row->points,
            strtoupper($row->tier ?? 'REGULAR'),
            (float) $row->debt_balance,
            $row->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

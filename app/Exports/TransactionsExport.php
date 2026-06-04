<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Transaction::with(['customer', 'creator', 'branch']);
        $query->filter($this->filters);
        return $query->orderByDesc('created_at');
    }

    public function headings(): array
    {
        return [
            'Nomor Invoice',
            'Tanggal',
            'Cabang',
            'Pelanggan',
            'Metode Pembayaran',
            'Subtotal',
            'Diskon',
            'Pajak',
            'Selisih Pembulatan',
            'Total',
            'Bayar',
            'Kembalian',
            'Status',
            'Kasir',
        ];
    }

    public function map($row): array
    {
        return [
            $row->invoice_number,
            $row->created_at->format('Y-m-d H:i:s'),
            $row->branch?->name ?? '-',
            $row->customer?->name ?? 'Umum',
            strtoupper($row->payment_method),
            (float) $row->subtotal,
            (float) $row->discount,
            (float) $row->tax,
            (float) $row->rounding_diff,
            (float) $row->total,
            (float) $row->paid_amount,
            (float) $row->change_amount,
            strtoupper($row->status),
            $row->creator?->name ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

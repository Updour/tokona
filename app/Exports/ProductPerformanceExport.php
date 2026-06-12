<?php

namespace App\Exports;

use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductPerformanceExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
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

        $itemsQuery = TransactionItem::whereHas('transaction', function ($q) use ($startDate, $endDate, $branchId) {
            $q->where('status', 'paid')
              ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        });

        // 100 Produk Terlaris & Estimasi Keuntungan Bersih (bukan hanya 10 seperti di dashboard)
        $topProducts = $itemsQuery
            ->select('product_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->with(['product:id,name,sku,base_cost'])
            ->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit(100)
            ->get();

        return $topProducts->map(function ($item) {
            $cost = (float) ($item->product->base_cost ?? 0);
            $revenue = (float) $item->total_revenue;
            $qty = (int) $item->total_qty;
            $profit = $revenue - ($cost * $qty);

            return [
                $item->product->name ?? 'Produk Terhapus',
                $item->product->sku ?? '-',
                $qty,
                $revenue,
                $profit
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Nama Produk',
            'SKU / Kode',
            'Total Kuantitas Terjual',
            'Total Omset Jual (IDR)',
            'Estimasi Laba Bersih (IDR)',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

<?php

namespace App\Exports;

use App\Models\Products;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StockValuationExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $subqueryStock = DB::table('stock_movements')
            ->select('product_id', DB::raw("SUM(CASE WHEN type IN ('IN', 'RETURN') THEN qty WHEN type = 'OUT' THEN -qty WHEN type = 'ADJUST' THEN qty ELSE 0 END) as current_stock"))
            ->groupBy('product_id');

        $query = Products::leftJoinSub($subqueryStock, 'sm', 'products.id', '=', 'sm.product_id');

        if (auth()->check() && !auth()->user()->isSuperAdmin()) {
            $query->where('products.tenant_id', auth()->user()->tenant_id);
        }

        $products = $query->select(
            'products.name',
            'products.sku',
            'products.category_id',
            'products.base_cost',
            'products.sell_price',
            DB::raw('COALESCE(sm.current_stock, 0) as stock')
        )
        ->with('category')
        ->orderBy('stock', 'asc')
        ->get();

        return $products->map(function ($p) {
            $stock = (int) $p->stock;
            $cost = (float) $p->base_cost;
            $price = (float) $p->sell_price;
            $totalCost = $stock * $cost;
            $totalRetail = $stock * $price;
            $margin = $totalRetail - $totalCost;

            return [
                $p->name,
                $p->sku ?? '-',
                $p->category->name ?? '-',
                $stock,
                $cost,
                $price,
                $totalCost,
                $totalRetail,
                $margin
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Nama Produk',
            'SKU',
            'Kategori',
            'Sisa Stok Saat Ini',
            'Harga Modal (HPP)',
            'Harga Jual Retail',
            'Total Valuasi Harta / Modal (IDR)',
            'Total Valuasi Jual (IDR)',
            'Potensi Keuntungan (IDR)',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

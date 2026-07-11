<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use App\Models\Products;

class OpnameImportPreview implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    private string $tenantId;
    public array $validItems = [];
    public array $invalidItems = [];
    public int $totalProcessed = 0;

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function collection(Collection $rows)
    {
        // Extract all SKUs
        $skus = $rows->pluck('sku')->filter()->toArray();
        $products = Products::where('tenant_id', $this->tenantId)
            ->whereIn('sku', $skus)
            ->withCurrentStock()
            ->get()
            ->keyBy('sku');

        foreach ($rows as $index => $row) {
            $this->totalProcessed++;
            
            $sku = $row['sku'] ?? null;
            $stokFisikRaw = $row['stok_fisik'] ?? '';
            $alasan = $row['alasan_selisih'] ?? '';

            if (!$sku) {
                continue;
            }

            if ($stokFisikRaw === '' || $stokFisikRaw === null) {
                // Lewati jika stok fisik tidak diisi (berarti tidak diaudit)
                continue;
            }

            $stokFisik = (int) $stokFisikRaw;
            $product = $products->get($sku);

            if (!$product) {
                $this->invalidItems[] = [
                    'row' => $index + 2,
                    'sku' => $sku,
                    'error' => "Produk dengan SKU {$sku} tidak ditemukan."
                ];
                continue;
            }

            $stokSistem = (int) ($product->current_stock ?? 0);
            $selisih = $stokFisik - $stokSistem;

            // Only add if there is a difference or they explicitly audited it
            $this->validItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'system_stock' => $stokSistem,
                'physical_stock' => $stokFisik,
                'difference' => $selisih,
                'reason' => $alasan
            ];
        }
    }
}

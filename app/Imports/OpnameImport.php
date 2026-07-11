<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use App\Models\Products;
use App\Services\InventoryService;

class OpnameImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    private string $tenantId;
    private string $branchId;
    private ?string $notes;
    private string $opnameDate;

    public function __construct(string $tenantId, string $branchId, ?string $notes, string $opnameDate)
    {
        $this->tenantId = $tenantId;
        $this->branchId = $branchId;
        $this->notes = $notes;
        $this->opnameDate = $opnameDate;
    }

    public function collection(Collection $rows)
    {
        $skus = $rows->pluck('sku')->filter()->toArray();
        $products = Products::where('tenant_id', $this->tenantId)
            ->whereIn('sku', $skus)
            ->withCurrentStock()
            ->get()
            ->keyBy('sku');

        $itemsToRecord = [];

        foreach ($rows as $row) {
            $sku = $row['sku'] ?? null;
            $stokFisikRaw = $row['stok_fisik'] ?? '';
            
            if (!$sku || $stokFisikRaw === '' || $stokFisikRaw === null) {
                continue;
            }

            $product = $products->get($sku);
            if (!$product) {
                continue;
            }

            $itemsToRecord[] = [
                'product_id' => $product->id,
                'physical_stock' => (int) $stokFisikRaw,
                'reason' => $row['alasan_selisih'] ?? null
            ];
        }

        if (count($itemsToRecord) > 0) {
            $inventoryService = app(InventoryService::class);
            $inventoryService->recordOpname([
                'branch_id' => $this->branchId,
                'opname_date' => $this->opnameDate,
                'notes' => $this->notes,
                'items' => $itemsToRecord
            ]);
        }
    }
}

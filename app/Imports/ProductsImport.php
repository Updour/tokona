<?php

namespace App\Imports;

use App\Models\Products;
use App\Models\ProductCategory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Str;

class ProductsImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    private string $tenantId;

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function model(array $row)
    {
        $categoryName = trim($row['kategori'] ?? 'Umum');
        
        // Cari atau buat kategori baru otomatis
        $category = ProductCategory::firstOrCreate(
            [
                'tenant_id' => $this->tenantId,
                'name' => $categoryName,
            ],
            [
                'slug' => Str::slug($categoryName) . '-' . Str::random(5)
            ]
        );

        $sku = trim($row['sku']);
        
        // Cari produk berdasarkan SKU (jika ada, update. Jika tidak, create)
        $product = Products::where('tenant_id', $this->tenantId)
            ->where('sku', $sku)
            ->first();

        if ($product) {
            $product->update([
                'name' => $row['nama_produk'],
                'category_id' => $category->id,
                'barcode' => $row['barcode'] ?? null,
                'base_cost' => $row['harga_modal'] ?? 0,
                'sell_price' => $row['harga_jual'] ?? 0,
            ]);
            return null; // Return null karena di-update, bukan model baru yang di-create
        }

        return new Products([
            'tenant_id' => $this->tenantId,
            'name' => $row['nama_produk'],
            'sku' => $sku,
            'category_id' => $category->id,
            'barcode' => $row['barcode'] ?? null,
            'base_cost' => $row['harga_modal'] ?? 0,
            'sell_price' => $row['harga_jual'] ?? 0,
            'track_stock' => true,
            'status' => 'active',
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_produk' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'kategori' => 'nullable|string|max:255',
            'harga_modal' => 'nullable|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
        ];
    }
}

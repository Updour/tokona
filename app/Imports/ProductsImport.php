<?php

namespace App\Imports;

use App\Models\Products;
use App\Models\ProductCategory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Str;

class ProductsImport implements \Maatwebsite\Excel\Concerns\ToCollection, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    private string $tenantId;
    private string $branchId;

    public function __construct(string $tenantId, string $branchId)
    {
        $this->tenantId = $tenantId;
        $this->branchId = $branchId;
    }

    public function prepareForValidation($data, $index)
    {
        $data['nama_produk'] = strtoupper(trim($data['nama_produk'] ?? ''));
        return $data;
    }

    private function generateSku(string $categoryName, string $productName): string
    {
        $parts = [];

        // 1. Singkatan Kategori
        if ($categoryName) {
            $catClean = preg_replace('/[^a-zA-Z0-9]/', '', strtoupper($categoryName));
            $catConsonants = preg_replace('/[AEIOU]/', '', $catClean);
            $catBase = strlen($catConsonants) >= 3 ? $catConsonants : $catClean;
            if (strlen($catBase) > 0) {
                $parts[] = substr($catBase, 0, 3);
            }
        }

        // 2. Singkatan Nama Produk
        $words = array_values(array_filter(explode(' ', trim($productName))));
        if (count($words) > 0) {
            $parts[] = strtoupper(substr($words[0], 0, 3));
        }
        if (count($words) > 1) {
            $consonants = preg_replace('/[AEIOUaeiou]/', '', $words[1]);
            $part2 = strlen($consonants) > 0 ? strtoupper(substr($consonants, 0, 3)) : strtoupper(substr($words[1], 0, 3));
            $parts[] = $part2;
        }

        if (empty($parts)) {
            $parts[] = 'PRD';
            $parts[] = strtoupper(Str::random(3));
        }

        // 3. 3 angka acak
        $parts[] = str_pad((string) mt_rand(0, 999), 3, '0', STR_PAD_LEFT);

        return implode('-', $parts);
    }

    public function collection(\Illuminate\Support\Collection $rows)
    {
        foreach ($rows as $row) {
            $categoryName = trim($row['kategori'] ?? 'Umum');
            $category = ProductCategory::firstOrCreate(
                ['tenant_id' => $this->tenantId, 'name' => $categoryName],
                ['slug' => Str::slug($categoryName) . '-' . Str::random(5)]
            );

            $typeName = trim($row['tipe_produk'] ?? 'Barang');
            $type = \App\Models\ProductType::firstOrCreate(
                ['tenant_id' => $this->tenantId, 'name' => $typeName]
            );

            $sku = !empty($row['sku']) 
                ? trim($row['sku']) 
                : $this->generateSku($categoryName, $row['nama_produk']);
            
            $product = Products::create([
                'tenant_id' => $this->tenantId,
                'branch_id' => $this->branchId,
                'name' => $row['nama_produk'], // Sudah uppercase karena prepareForValidation
                'sku' => $sku,
                'category_id' => $category->id,
                'type_id' => $type->id,
                'barcode' => $row['barcode'] ?? null,
                'base_cost' => $row['harga_modal'] ?? 0,
                'sell_price' => $row['harga_jual'] ?? 0,
                'track_stock' => true,
                'status' => 'active',
            ]);

            if (isset($row['stok']) && (int) $row['stok'] > 0) {
                $product->recordStockMovement('IN', (int) $row['stok'], [
                    'source_type' => 'initial',
                    'notes'       => 'Stok awal dari import',
                ]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'nama_produk' => [
                'required',
                'string',
                'max:255',
                'distinct',
                \Illuminate\Validation\Rule::unique('products', 'name')->where(function ($query) {
                    return $query->where('tenant_id', $this->tenantId);
                })
            ],
            'kategori' => 'nullable|string|max:255',
            'tipe_produk' => 'nullable|string|max:255',
            'stok' => 'nullable|integer|min:0',
            'harga_modal' => 'nullable|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama_produk.unique' => 'Nama produk ":input" sudah terdaftar, tidak boleh sama.',
            'nama_produk.distinct' => 'Nama produk ":input" terduplikasi di dalam file Excel.',
        ];
    }
}

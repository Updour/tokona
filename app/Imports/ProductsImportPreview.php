<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class ProductsImportPreview implements ToCollection, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    private string $tenantId;
    public array $newCategories = [];
    public array $newTypes = [];
    public array $categoryExamples = [];
    public array $typeExamples = [];

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function prepareForValidation($data, $index)
    {
        $data['nama_produk'] = strtoupper(trim($data['nama_produk'] ?? ''));
        return $data;
    }

    public function collection(Collection $rows)
    {
        $foundCategories = [];
        $foundTypes = [];

        foreach ($rows as $row) {
            $catInput = trim($row['kategori'] ?? '');
            $categoryName = $catInput !== '' ? ucwords(strtolower($catInput)) : 'Umum';
            $foundCategories[] = $categoryName;
            
            if (!isset($this->categoryExamples[$categoryName])) {
                $this->categoryExamples[$categoryName] = [];
            }
            if (count($this->categoryExamples[$categoryName]) < 3) {
                $this->categoryExamples[$categoryName][] = $row['nama_produk'] ?? 'Tanpa Nama';
            }

            $typeInput = trim($row['tipe_produk'] ?? '');
            $typeName = $typeInput !== '' ? ucwords(strtolower($typeInput)) : 'Barang';
            $foundTypes[] = $typeName;

            if (!isset($this->typeExamples[$typeName])) {
                $this->typeExamples[$typeName] = [];
            }
            if (count($this->typeExamples[$typeName]) < 3) {
                $this->typeExamples[$typeName][] = $row['nama_produk'] ?? 'Tanpa Nama';
            }
        }

        $foundCategories = array_unique($foundCategories);
        $foundTypes = array_unique($foundTypes);

        // Cari yang belum ada di DB (Case-insensitive)
        $existingCategories = \App\Models\ProductCategory::where('tenant_id', $this->tenantId)
            ->pluck('name')
            ->toArray();
        $existingCatLower = array_map('strtolower', $existingCategories);

        $existingTypes = \App\Models\ProductType::where('tenant_id', $this->tenantId)
            ->pluck('name')
            ->toArray();
        $existingTypeLower = array_map('strtolower', $existingTypes);

        // Cari perbedaannya (yang baru)
        $this->newCategories = [];
        foreach ($foundCategories as $cat) {
            if (!in_array(strtolower($cat), $existingCatLower)) {
                $this->newCategories[] = $cat;
            }
        }

        $this->newTypes = [];
        foreach ($foundTypes as $type) {
            if (!in_array(strtolower($type), $existingTypeLower)) {
                $this->newTypes[] = $type;
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
            'harga_min_jual' => 'nullable|numeric|min:0',
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

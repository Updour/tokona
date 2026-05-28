<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId    = $this->route('product')?->id ?? $this->route('product');
        $isSuperAdmin = $this->user()?->isSuperAdmin() ?? false;

        return [
            // Super admin wajib kirim tenant_id dari form
            // User biasa: di-inject controller, tidak perlu validasi
            'tenant_id' => $isSuperAdmin
                ? ['required', 'uuid', 'exists:tenants,id']
                : ['nullable', 'uuid'],

            'branch_id'   => ['required', 'uuid', 'exists:branches,id'],
            'category_id' => ['nullable', 'uuid', 'exists:product_categories,id'],
            'type_id'     => ['nullable', 'uuid', 'exists:product_types,id'],
            'supplier_id' => ['nullable', 'string', 'max:255'],

            'name' => ['required', 'string', 'min:3', 'max:255'],

            'sku' => [
                'nullable', 'string', 'max:100',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'barcode' => [
                'nullable', 'string', 'max:100',
                Rule::unique('products', 'barcode')->ignore($productId),
            ],

            'description'   => ['nullable', 'string'],
            'base_cost'     => ['required', 'numeric', 'min:0'],
            'sell_price'    => ['required', 'numeric', 'min:0'],
            'min_sell_price' => ['nullable', 'numeric', 'min:0', 'lte:sell_price'],

            'track_stock'          => ['required', 'boolean'],
            'allow_negative_stock' => ['required', 'boolean'],
            'is_active'            => ['required', 'boolean'],
            'source'               => ['nullable', 'string', 'max:100'],

            // Stok awal — hanya saat create
            'initial_stock' => ['nullable', 'integer', 'min:0'],

            // Gambar saat create
            'images'   => ['nullable', 'array', 'max:10'],
            'images.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function attributes(): array
    {
        return [
            'tenant_id'      => 'Tenant',
            'branch_id'      => 'Cabang',
            'category_id'    => 'Kategori',
            'type_id'        => 'Tipe Produk',
            'base_cost'      => 'HPP',
            'sell_price'     => 'Harga Jual',
            'min_sell_price' => 'Harga Minimum Jual',
            'initial_stock'  => 'Stok Awal',
        ];
    }
}

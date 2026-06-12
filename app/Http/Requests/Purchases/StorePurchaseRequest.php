<?php

namespace App\Http\Requests\Purchases;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id'      => 'required|uuid',
            'supplier_id'    => 'nullable|uuid',
            'invoice_number' => 'nullable|string',
            'purchase_date'  => 'required|date',
            'status'         => 'required|in:draft,received,paid',
            'global_discount'=> 'nullable|numeric|min:0',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.unit_cost'  => 'required|numeric|min:0',
            'items.*.discount'   => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'Cabang penerima wajib dipilih.',
            'items.required'     => 'Keranjang pembelian tidak boleh kosong.',
            'items.min'          => 'Minimal harus ada 1 barang dalam keranjang.',
            'items.*.qty.min'    => 'Jumlah barang minimal 1.',
        ];
    }
}

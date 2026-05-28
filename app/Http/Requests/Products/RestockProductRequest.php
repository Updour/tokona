<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RestockProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'      => ['required', Rule::in(['IN', 'ADJUST', 'RETURN'])],
            'qty'       => ['required', 'integer', 'min:1'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'notes'     => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'type'      => 'Tipe Pergerakan',
            'qty'       => 'Jumlah',
            'unit_cost' => 'Harga Satuan',
        ];
    }
}

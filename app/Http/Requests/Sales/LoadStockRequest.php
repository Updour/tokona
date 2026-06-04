<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class LoadStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'sales_person_id' => 'required|uuid|exists:sales_people,id',
            'product_id' => 'required|uuid|exists:products,id',
            'qty' => 'required|integer|min:1',
        ];
    }
}

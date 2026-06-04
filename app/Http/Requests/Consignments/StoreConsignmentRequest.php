<?php

namespace App\Http\Requests\Consignments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreConsignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => 'required|uuid|exists:branches,id',
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'consignment_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:consignment_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.base_cost' => 'required|numeric|min:0',
        ];
    }
}

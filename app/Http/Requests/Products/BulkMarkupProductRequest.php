<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class BulkMarkupProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'uuid', 'exists:product_categories,id'],
            'branch_id' => ['nullable', 'uuid', 'exists:branches,id'],
            'markup_type' => ['required', 'in:percentage,fixed'],
            'markup_value' => ['required', 'numeric'],
        ];
    }
}

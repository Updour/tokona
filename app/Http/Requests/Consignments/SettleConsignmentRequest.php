<?php

namespace App\Http\Requests\Consignments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SettleConsignmentRequest extends FormRequest
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
            'total_discount' => 'nullable|numeric|min:0',
            'unsold_action' => 'required|string|in:rollover,return',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|uuid|exists:consignment_items,id',
            'items.*.qty_unsold' => 'required|integer|min:0',
        ];
    }
}

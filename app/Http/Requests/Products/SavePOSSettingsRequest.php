<?php

namespace App\Http\Requests\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SavePOSSettingsRequest extends FormRequest
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
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'taxEnabled' => 'required|boolean',
            'taxRate' => 'required|integer|min:0|max:100',
            'activeMethods' => 'required|array',
            'activeMethods.cash' => 'required|boolean',
            'activeMethods.transfer' => 'required|boolean',
            'activeMethods.debt' => 'required|boolean',
            'roundingNearest' => 'nullable|integer|in:1,100,500,1000',
            'roundingMethod' => 'nullable|string|in:round,floor,ceil',
        ];
    }
}

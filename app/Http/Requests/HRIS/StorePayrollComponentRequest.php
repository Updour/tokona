<?php

namespace App\Http\Requests\HRIS;

use Illuminate\Foundation\Http\FormRequest;

class StorePayrollComponentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:allowance,deduction',
            'amount' => 'required|numeric|min:0',
            'is_taxable' => 'boolean',
            'tenant_id' => 'nullable|exists:tenants,id',
        ];
    }
}

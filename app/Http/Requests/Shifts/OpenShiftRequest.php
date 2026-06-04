<?php

namespace App\Http\Requests\Shifts;

use Illuminate\Foundation\Http\FormRequest;

class OpenShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'branch_id'       => ['nullable', 'uuid', 'exists:branches,id'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'opening_balance.required' => 'Saldo awal wajib diisi.',
            'opening_balance.min'      => 'Saldo awal tidak boleh minus.',
        ];
    }
}

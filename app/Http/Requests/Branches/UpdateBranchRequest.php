<?php

namespace App\Http\Requests\Branches;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Branch;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan Validasi Edit Cabang.
     */
    public function rules(): array
    {
        // Ambil data cabang yang sedang di-update melalui route parameter laravel
        $branchId = $this->route('branch');

        return [
            // Saat update, biasanya tenant_id dikunci (tidak boleh diubah-ubah lewat input)
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'name' => ['required', 'string', 'max:100'],

            // Validasi unik, tetapi abaikan record ID cabang ini sendiri
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('branches')
                    ->where(fn($query) => $query->where('tenant_id', $this->tenant_id))
                    ->ignore($branchId)
            ],

            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_main' => ['required', 'boolean'],
            'pos_settings' => ['nullable', 'array'],
            'pos_settings.taxEnabled' => ['nullable', 'boolean'],
            'pos_settings.taxRate' => ['nullable', 'integer', 'min:0', 'max:100'],
            'pos_settings.activeMethods' => ['nullable', 'array'],
            'pos_settings.activeMethods.cash' => ['nullable', 'boolean'],
            'pos_settings.activeMethods.transfer' => ['nullable', 'boolean'],
            'pos_settings.activeMethods.debt' => ['nullable', 'boolean'],
            'pos_settings.roundingNearest' => ['nullable', 'integer', 'in:1,100,500,1000'],
            'pos_settings.roundingMethod' => ['nullable', 'string', 'in:round,floor,ceil'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'Kode cabang ini sudah digunakan di toko Anda.',
        ];
    }
}

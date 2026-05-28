<?php

namespace App\Http\Requests\Branches;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBranchRequest extends FormRequest
{
    /**
     * Izinkan user yang sudah login untuk mengeksekusi request ini.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan Validasi Tambah Cabang.
     */
    public function rules(): array
    {
        return [
            // Tenant ID wajib ada dan harus valid terdaftar di tabel tenants
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],

            // Nama cabang wajib diisi
            'name' => ['required', 'string', 'max:100'],

            // Code wajib diisi dan unik untuk setiap tenant agar tidak bentrok dengan tenant lain
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('branches')->where(fn($query) => $query->where('tenant_id', $this->tenant_id))
            ],

            // Kolom opsional (Boleh null)
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],

            // Koordinat maps opsional, namun jika diisi harus berformat desimal derajat yang valid
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Penanda cabang utama harus berupa boolean (true/false)
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

    /**
     * Custom pesan error jika validasi gagal (Opsional).
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'Kode cabang ini sudah digunakan di toko Anda.',
            'latitude.between' => 'Format koordinat latitude tidak valid.',
            'longitude.between' => 'Format koordinat longitude tidak valid.',
        ];
    }
}

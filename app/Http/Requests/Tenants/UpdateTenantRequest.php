<?php

namespace App\Http\Requests\Tenants;

use App\Models\Tenants;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenantId = $this->route('tenant');
        $tenant = Tenants::withoutGlobalScopes()->find($tenantId);

        if (!$tenant) {
            return false;
        }

        // Izinkan jika dia Super Admin ATAU dia adalah pemilik tenant itu sendiri
        return auth()->user()->isSuperAdmin() || auth()->user()->tenant_id === $tenant->id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:active,suspended,trial'],
            'plan' => ['nullable', 'in:free,pro,enterprise'],
            'expires_at' => ['nullable', 'date'],

            'latitude' => ['nullable', 'string', 'max:100'],
            'longitude' => ['nullable', 'string', 'max:100'],
            'address_text' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'maps_link' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }
}
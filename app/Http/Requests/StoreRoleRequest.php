<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class StoreRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('roles.index');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = auth()->user()->tenant_id;
        if (auth()->user()->isSuperAdmin() && !$tenantId) {
            $tenantId = \App\Models\Tenants::first()?->id;
        }

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($tenantId) {
                    $slug = Str::slug($value);
                    $exists = \App\Models\Role::where('tenant_id', $tenantId)
                        ->where('name', $slug)
                        ->exists();
                    if ($exists) {
                        $fail('Nama peran ini sudah ada.');
                    }
                },
            ],
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ];
    }
}

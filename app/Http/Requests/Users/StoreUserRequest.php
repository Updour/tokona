<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // We will handle authorization in policies or middleware
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')],
            'password' => ['required', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'tenant_id' => ['nullable', 'uuid', 'exists:tenants,id'],
            'branch_id' => ['nullable', 'uuid', 'exists:branches,id'],
            'role_id' => ['required', 'uuid', 'exists:roles,id'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:100'],
            'join_date' => ['nullable', 'date'],
            'employment_status' => ['nullable', 'string', 'max:50'],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}

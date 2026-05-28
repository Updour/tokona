<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($this->user)],
            'password' => ['nullable', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'tenant_id' => ['nullable', 'uuid', 'exists:tenants,id'],
            'branch_id' => ['required', 'uuid', 'exists:branches,id'],
            'role_id' => ['required', 'uuid', 'exists:roles,id'],
            'avatar' => ['nullable', 'string', 'max:255'],
        ];
    }
}

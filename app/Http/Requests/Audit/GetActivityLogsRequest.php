<?php

namespace App\Http\Requests\Audit;

use Illuminate\Foundation\Http\FormRequest;

class GetActivityLogsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'string', 'uuid'],
            'branch_id' => ['nullable', 'string', 'uuid'],
            'action' => ['nullable', 'string', 'max:50'],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ];
    }
}

<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_branch_id' => 'required_if:is_super_admin,true|nullable|uuid|exists:branches,id',
            'destination_branch_id' => 'required|uuid|exists:branches,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ];
    }
}

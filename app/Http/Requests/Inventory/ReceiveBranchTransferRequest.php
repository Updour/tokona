<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class ReceiveBranchTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|uuid|exists:branch_transfer_items,id',
            'items.*.received_qty' => 'required|integer|min:0',
        ];
    }
}

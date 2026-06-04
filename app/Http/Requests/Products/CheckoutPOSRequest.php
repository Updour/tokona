<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutPOSRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|string',
            'is_offline_sync' => 'nullable|boolean',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'redeem_points' => 'nullable|integer|min:0',
            'rounding_diff' => 'nullable|numeric',
            'total' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'cash_amount' => 'nullable|numeric|min:0',
            'transfer_amount' => 'nullable|numeric|min:0',
            'change_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,transfer,debt,split',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
        ];
    }
}

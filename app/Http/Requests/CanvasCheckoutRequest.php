<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CanvasCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sales_visit_id' => 'required|uuid|exists:sales_visits,id',
            'customer_id' => 'required|uuid|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,qris,transfer',
            'amount_paid' => 'required|numeric|min:0',
        ];
    }
}

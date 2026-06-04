<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CanvasCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|uuid|exists:customers,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address_text' => 'nullable|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:5120',
        ];
    }
}

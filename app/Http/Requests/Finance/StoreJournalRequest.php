<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'branch_id' => ['nullable', 'exists:branches,id'],
            'entries' => ['required', 'array', 'min:2'], // A journal must have at least 2 entries (debit & credit)
            'entries.*.account_id' => ['required', 'exists:accounts,id'],
            'entries.*.debit' => ['required', 'numeric', 'min:0'],
            'entries.*.credit' => ['required', 'numeric', 'min:0'],
            'entries.*.description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array
    {
        return [
            'entries.min' => 'Jurnal harus memiliki setidaknya dua baris entry.',
            'entries.*.account_id.required' => 'Akun harus dipilih untuk setiap baris entry.',
            'entries.*.debit.min' => 'Nilai debit tidak boleh negatif.',
            'entries.*.credit.min' => 'Nilai kredit tidak boleh negatif.',
        ];
    }
}

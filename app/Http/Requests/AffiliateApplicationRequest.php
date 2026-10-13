<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AffiliateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Satu user hanya boleh punya satu baris afiliator.
        return ! $this->user()->affiliate()->exists();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:affiliates,email',
            'phone' => 'required|string|max:30',
            'payout_method' => 'required|in:bank,ewallet',
            'bank_name' => 'required|string|max:60',
            'bank_account_number' => 'required|string|max:40',
            'bank_account_name' => 'required|string|max:100',
            'applicant_note' => 'nullable|string|max:1000',
            'terms' => 'accepted',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar sebagai afiliator.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'payout_method.required' => 'Pilih metode pencairan.',
            'bank_name.required' => 'Nama bank atau e-wallet wajib diisi.',
            'bank_account_number.required' => 'Nomor rekening wajib diisi.',
            'bank_account_name.required' => 'Nama pemilik rekening wajib diisi.',
            'applicant_note.max' => 'Keterangan maksimal 1.000 karakter.',
            'terms.accepted' => 'Anda harus menyetujui syarat & ketentuan afiliasi.',
        ];
    }
}

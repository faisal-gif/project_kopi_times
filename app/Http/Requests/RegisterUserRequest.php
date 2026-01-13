<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterUserRequest extends FormRequest
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
            'name' => 'required|string|max:30',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'prov' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'contact' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'plan_id' => 'required|exists:news_package,id',
            'profesi' => 'required|exists:kategori_kt,kategori_id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama Lengkap tidak boleh lebih 30 karakter',
            'email.required' => 'Alamat email tidak boleh kosong.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar, silakan gunakan email lain.',
            'prov.required' => 'Silakan pilih provinsi Anda.',
            'city.required' => 'Kota/Kabupaten harus diisi.',
            'address.required' => 'Alamat harus diisi.',
            'contact.required' => 'Nomor kontak/HP wajib diisi.',
            'password.required' => 'Kata sandi tidak boleh kosong.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal harus :min karakter.',
            'plan_id.required' => 'Silakan pilih paket langganan terlebih dahulu.',
            'plan_id.exists' => 'Paket yang dipilih tidak valid.',
            'profesi.required' => 'Silakan pilih kategori Anda.',
            'profesi.exists' => 'Kategori yang dipilih tidak valid.',
        ];
    }
}

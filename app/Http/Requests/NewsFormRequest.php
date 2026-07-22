<?php

namespace App\Http\Requests;

use App\Models\ImagesThumbnail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NewsFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Foto wajib hanya jika user BELUM punya thumbnail jadi di images_thumbnail
        $hasThumbnail = ImagesThumbnail::where('user_id', $this->user()->id)->exists();

        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'city' => 'required|string|max:100',
            'narsum' => 'required|string|max:255',
            'profesi' => 'required|string|max:255',
            'contact' => 'required|string|max:100',
            'image' => [
                Rule::requiredIf(!$hasThumbnail),
                'nullable',
                'image',
                'max:4096',
            ],
            'image_2' => 'nullable|image|max:4096',
            'image_3' => 'nullable|image|max:4096',
            'caption' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Title
            'title.required' => 'Judul wajib diisi.',
            'title.string'   => 'Judul harus berupa teks.',
            'title.max'      => 'Judul maksimal 255 karakter.',

            // Content
            'content.required' => 'Konten atau isi wajib diisi.',
            'content.string'   => 'Konten harus berupa teks.',

            // City
            'city.required' => 'Kota asal wajib diisi.',
            'city.string'   => 'Kota harus berupa teks.',
            'city.max'      => 'Nama kota maksimal 100 karakter.',

            // Narsum
            'narsum.required' => 'Nama narasumber wajib diisi.',
            'narsum.string'   => 'Nama narasumber harus berupa teks.',
            'narsum.max'      => 'Nama narasumber maksimal 255 karakter.',

            // Profesi
            'profesi.required' => 'Profesi wajib diisi.',
            'profesi.string'   => 'Profesi harus berupa teks.',
            'profesi.max'      => 'Profesi maksimal 255 karakter.',

            // Contact
            'contact.required' => 'Kontak wajib diisi.',
            'contact.string'   => 'Kontak harus berupa teks.',
            'contact.max'      => 'Kontak maksimal 100 karakter.',

            // Image 1 (Thumbnail utama)
            'image.required' => 'Foto wajib diunggah untuk opini pertama Anda.',
            'image.image'    => 'File yang diunggah harus berupa gambar.',
            'image.max'      => 'Ukuran gambar pertama maksimal 4MB.',

            // Image 2
            'image_2.image' => 'File gambar kedua harus berupa gambar.',
            'image_2.max'   => 'Ukuran gambar kedua maksimal 4MB.',

            // Image 3
            'image_3.image' => 'File gambar ketiga harus berupa gambar.',
            'image_3.max'   => 'Ukuran gambar ketiga maksimal 4MB.',

            // Caption
            'caption.string' => 'Caption harus berupa teks.',
            'caption.max'    => 'Caption maksimal 255 karakter.',
        ];
    }
}

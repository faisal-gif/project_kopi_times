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
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Foto wajib diunggah untuk opini pertama Anda.',
        ];
    }
}
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'city' => 'required|string|max:100',
            'narsum' => 'required|string|max:255',
            'profesi' => 'required|string|max:255',
            'contact' => 'required|string|max:100',
            'image' => 'required|image|max:4096',
            'image_2' => 'nullable|image|max:4096',
            'image_3' => 'nullable|image|max:4096',
            'caption' => 'nullable|string|max:255',
        ];
    }
}

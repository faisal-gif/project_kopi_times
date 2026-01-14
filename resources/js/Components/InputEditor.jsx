import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function InputEditor({ value, onChange }) {
    return (
        <Editor

            tinymceScriptSrc="/vendor/tinymce/tinymce.min.js"
            referrerPolicy='origin'
            value={value}
            onEditorChange={(content, editor) => {
                onChange(content);
            }}

            // 3. Konfigurasi Fitur Lengkap
            init={{
                license_key: 'gpl',
                height: 500,
                forced_root_block: 'p',
                noneditable_class: 'instagram-media',
                extended_valid_elements: '+script[language|type|src]',
                contextmenu: false,
                quickbars_insert_toolbar: false,
                quickbars_selection_toolbar: false,
                mobile: {
                    menubar: false,
                    toolbar_mode: 'wrap',
                },

                plugins: [
                    'searchreplace', 'lists', 'advlist', 'link',
                    'charmap', 'pagebreak', 'nonbreaking',
                    'visualblocks', 'visualchars', 'fullscreen',
                    'insertdatetime', 'table', 'help',
                    'wordcount'
                ],
                toolbar:
                    'bold italic underline strikethrough | ' +
                    'numlist bullist | ' +
                    'outdent indent | ' +
                    'blockquote | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'ltr rtl | ' +
                    'hr pagebreak | ',
                image_title: true,
                file_picker_types: '',
                image_advtab: false,
                automatic_uploads: false,
                menubar: false,
                branding: false,
                promotion: false,

                content_style: `
                    html, body { height: 100%; margin: 0; } 
                    body { 
                        font-family:Helvetica,Arial,sans-serif; 
                        font-size:16px; 
                        padding: 10px; /* Memberi ruang napas di pinggir */
                        box-sizing: border-box; 
                    }
                    .instagram-media { margin: 10px auto !important; }
                `,
            }}
        />
    );
}
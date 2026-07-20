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

            init={{
                license_key: 'gpl',
                height: 500,
                forced_root_block: 'p',
                
                // 1. BATASI TAG HTML YANG DIIZINKAN HANYA <p> DAN <br>
                // Semua format seperti <strong>, <em>, <span>, <ul> akan otomatis dihapus
                valid_elements: 'p,br', 

                // 2. Cegah format terbawa saat copy-paste dari luar
                paste_as_text: true,

                mobile: {
                    menubar: false,
                    toolbar_mode: 'wrap',
                },

                plugins: [
                    'searchreplace', 'wordcount', 'paste'
                ],
                
                toolbar: 'undo redo | removeformat',

                menubar: false,
                branding: false,
                promotion: false,

                content_style: `
                    html, body { height: 100%; margin: 0; } 
                    body { 
                        font-family:Helvetica,Arial,sans-serif; 
                        font-size:16px; 
                        padding: 10px;
                        box-sizing: border-box; 
                    }
                `,
            }}
        />
    );
}
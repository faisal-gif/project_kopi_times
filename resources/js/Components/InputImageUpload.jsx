import { useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";

export default function InputImageUpload({
    label = "Upload Gambar",
    value = null, // File | string (URL)
    onChange,
    accept = "image/jpeg,image/png,image/webp",
    className = "",
}) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(
        typeof value === "string" ? value : null
    );

    const handleFile = (file) => {
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onChange(file);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const removeImage = () => {
        setPreview(null);
        onChange(null);
        inputRef.current.value = "";
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="label">
                <span className="label-text font-bold">{label}</span>
            </label>

            {/* Upload Area */}
            <div
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative cursor-pointer border-2 border-dashed rounded-box p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition"
            >
                {!preview && (
                    <>
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                        <p className="text-sm text-gray-500 text-center">
                            Klik atau drag gambar ke sini
                        </p>
                        <p className="text-xs text-gray-400">
                            JPG, PNG, WEBP
                        </p>
                    </>
                )}

                {preview && (
                    <div className="relative w-full">
                        <img
                            src={preview}
                            alt="Preview"
                            className="rounded-box max-h-56 mx-auto object-contain"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                            }}
                            className="btn btn-error btn-xs absolute top-2 right-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    hidden
                    onChange={handleInputChange}

                />
                <p className="text-sm text-gray-400 text-center">
                    Ukuran Maksimal 4MB
                </p>
                <p className="text-xs text-gray-400">
                    Foto tambahan silahkan melalui email redaksi.
                </p>

            </div>
        </div>
    );
}

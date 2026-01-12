import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { router } from "@inertiajs/react";
import { Upload } from "lucide-react";

export default function AvatarCrop() {
    const [open, setOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState(null);
    const [rawFile, setRawFile] = useState(null);

    const onCropComplete = useCallback((_, areaPixels) => {
        setCroppedArea(areaPixels);
    }, []);

    // 1️⃣ User pilih file → modal langsung buka
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setOpen(true);
        };
        reader.readAsDataURL(file);
    };

    // 2️⃣ Simpan hasil crop
    const saveAvatar = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const image = new Image();
        image.src = imageSrc;
        await new Promise((r) => (image.onload = r));

        const size = 300;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            image,
            croppedArea.x,
            croppedArea.y,
            croppedArea.width,
            croppedArea.height,
            0,
            0,
            size,
            size
        );

        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append("avatar", blob, "avatar.png");
            formData.append("avatar_raw", rawFile);

            router.post("/profile/avatar", formData, {
                forceFormData: true,
                onSuccess: () => {
                    setOpen(false);
                    setImageSrc(null);
                    setRawFile(null);
                },
            });
        }, "image/png");
    };

    return (
        <>
            {/* Upload input */}
            <label className="cursor-pointer inline-flex items-center gap-2">
                <span className="btn btn-primary btn-sm"><Upload className="w-4 h-4" />  Ganti Avatar</span>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                />
            </label>

            {/* Modal Crop */}
            {open && (
                <div className="fixed inset-0 z-50 px-2 bg-black/50 flex items-center justify-center">
                    <div className="bg-base-100 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-lg font-semibold">Crop Avatar</h2>

                        {/* Crop Area */}
                        <div className="relative w-full h-72 bg-black/50 rounded-lg overflow-hidden">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                minZoom={1}
                                maxZoom={3}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        {/* Zoom Control */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm">-</span>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(e.target.value)}
                                className="range range-sm range-primary flex-1"
                            />
                            <span className="text-sm">+</span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={saveAvatar}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

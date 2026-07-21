import { useState, useRef, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import { ImageUp } from 'lucide-react';

const FRAME_SRC = '/images/frame-kopitimes.png';

export default function ThumbnailCrop({ currentThumbnail, onComplete, processing = false }) {
    const [imageToCrop, setImageToCrop] = useState(null);
    const [frameSize, setFrameSize] = useState(null);
    const cropperRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = FRAME_SRC;
        img.onload = () => setFrameSize({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => alert('Gagal memuat frame. Pastikan path file benar.');
    }, []);

    const frameRatio = frameSize ? frameSize.width / frameSize.height : 16 / 9;

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImageToCrop(reader.result);
        reader.readAsDataURL(file);
        e.target.value = ''; // biar file yang sama bisa dipilih ulang
    };

    const handleCropperReady = () => {
        const cropper = cropperRef.current;
        if (!cropper) return;
        const container = cropper.getContainerData();
        cropper.setCropBoxData({ left: 0, top: 0, width: container.width, height: container.height });
    };

    const handleSaveCrop = () => {
        const cropper = cropperRef.current;
        if (!cropper || !frameSize) return;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: frameSize.width,
            height: frameSize.height,
            fillColor: '#FFFFFF',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        const frameImage = new window.Image();
        frameImage.src = FRAME_SRC;
        frameImage.onload = () => {
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = frameSize.width;
            finalCanvas.height = frameSize.height;
            const ctx = finalCanvas.getContext('2d');
            ctx.drawImage(croppedCanvas, 0, 0);
            ctx.drawImage(frameImage, 0, 0, finalCanvas.width, finalCanvas.height);

            finalCanvas.toBlob((blob) => {
                const file = new File([blob], 'thumbnail_kopitimes.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                onComplete(file);
                setImageToCrop(null);
            }, 'image/jpeg', 0.85);
        };
        frameImage.onerror = () => alert('Gagal memuat frame. Pastikan path file benar.');
    };

    return (
        <>
            {/* Preview + tombol */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="w-full max-w-[220px] shrink-0">
                    {currentThumbnail ? (
                        <img
                            src={currentThumbnail}
                            alt="Thumbnail berita"
                            className="w-full rounded-lg border border-base-200"
                        />
                    ) : (
                        <div className="grid aspect-[16/9] w-full place-items-center rounded-lg border-2 border-dashed border-base-300 bg-base-200/30 text-center text-sm text-muted-foreground">
                            Belum ada foto
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <p className="mb-3 text-sm text-muted-foreground">
                        Foto ini otomatis dipasang sebagai thumbnail di setiap opini yang Anda kirim.
                        Foto lama pada berita yang sudah tayang tidak ikut berubah.
                    </p>
                    <label className="inline-flex cursor-pointer">
                        <span className={`btn btn-primary btn-sm gap-2 ${processing ? 'btn-disabled' : ''}`}>
                            <ImageUp className="h-4 w-4" />
                            {currentThumbnail ? 'Ganti Foto Thumbnail' : 'Unggah Foto Thumbnail'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                </div>
            </div>

            {/* Modal Crop */}
            {imageToCrop && frameSize && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <style>{`
                        .custom-cropper .cropper-point,
                        .custom-cropper .cropper-line,
                        .custom-cropper .cropper-center,
                        .custom-cropper .cropper-dashed { display: none !important; }
                        .custom-cropper .cropper-view-box { outline: none !important; }
                    `}</style>

                    <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg">
                        <h2 className="mb-4 text-xl font-bold">Sesuaikan Posisi Foto</h2>

                        <div
                            className="relative mx-auto overflow-hidden bg-gray-200"
                            style={{
                                aspectRatio: `${frameSize.width} / ${frameSize.height}`,
                                width: `min(100%, calc(60vh * ${frameRatio}))`,
                            }}
                        >
                            <Cropper
                                className="custom-cropper"
                                src={imageToCrop}
                                style={{ height: '100%', width: '100%', position: 'absolute' }}
                                aspectRatio={frameRatio}
                                viewMode={0}
                                autoCropArea={1}
                                dragMode="move"
                                cropBoxMovable={false}
                                cropBoxResizable={false}
                                toggleDragModeOnDblclick={false}
                                modal={false}
                                highlight={false}
                                guides={false}
                                center={false}
                                background={false}
                                checkOrientation={true}
                                ready={handleCropperReady}
                                onInitialized={(instance) => { cropperRef.current = instance; }}
                            />
                            <img
                                src={FRAME_SRC}
                                alt="Frame Overlay"
                                className="pointer-events-none absolute inset-0 z-50 h-full w-full"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" className="btn btn-ghost bg-gray-200" onClick={() => setImageToCrop(null)}>
                                Batal
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveCrop}>
                                Potong & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
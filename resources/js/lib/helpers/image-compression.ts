interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 to 1
    type?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compresses an image file using HTML5 Canvas before uploading.
 * 
 * @param file The original image file
 * @param options Compression options (maxWidth, maxHeight, quality, type)
 * @returns A promise that resolves to the compressed File object
 */
export function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.75,
        type = 'image/webp' // webp gives best compression/quality ratio
    } = options;

    return new Promise((resolve, reject) => {
        // Hanya kompres jika file adalah gambar dan bukan SVG
        if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Hitung rasio aspek untuk resize
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // fallback jika canvas gagal
                    return;
                }

                // Gambar ulang gambar dengan ukuran baru
                ctx.drawImage(img, 0, 0, width, height);

                // Export dari canvas
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }

                        // Buat nama file baru (opsional: ganti ekstensi)
                        const originalName = file.name;
                        const lastDotIndex = originalName.lastIndexOf('.');
                        const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
                        const extension = type.split('/')[1] || 'jpeg';
                        const newFilename = `${baseName}_compressed.${extension}`;

                        const compressedFile = new File([blob], newFilename, {
                            type: type,
                            lastModified: Date.now()
                        });

                        resolve(compressedFile);
                    },
                    type,
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}

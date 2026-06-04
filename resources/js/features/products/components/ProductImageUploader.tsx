import { router } from '@inertiajs/react';
import { ImageOff, Upload, Star, Trash2, GripVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {ProductImage} from '@/pages/products/types';

interface Props {
    productId: string;
    images: ProductImage[];
}

export function ProductImageUploader({ productId, images }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
return;
}

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('images[]', file));

        setUploading(true);
        router.post(`/products/${productId}/images`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);

                if (inputRef.current) {
inputRef.current.value = '';
}
            },
        });
    };

    const handleSetPrimary = (imageId: string) => {
        router.patch(`/products/${productId}/images/${imageId}/set-primary`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (imageId: string) => {
        if (!confirm('Hapus gambar ini?')) {
return;
}

        router.delete(`/products/${productId}/images/${imageId}`, {
            preserveScroll: true,
        });
    };

    // ── Drag & Drop reorder ───────────────────────────────────────────────────
    const handleDragStart = (id: string) => setDraggingId(id);
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragOverId(id);
    };
    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();

        if (!draggingId || draggingId === targetId) {
            setDraggingId(null);
            setDragOverId(null);

            return;
        }

        const currentOrder = [...images].sort((a, b) => a.sort_order - b.sort_order);
        const fromIdx = currentOrder.findIndex((img) => img.id === draggingId);
        const toIdx   = currentOrder.findIndex((img) => img.id === targetId);

        const reordered = [...currentOrder];
        const [moved]   = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        router.patch(`/products/${productId}/images/reorder`, {
            order: reordered.map((img) => img.id),
        }, { preserveScroll: true });

        setDraggingId(null);
        setDragOverId(null);
    };

    const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="space-y-3">
            {/* Grid gambar */}
            {sortedImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {sortedImages.map((img) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => handleDragStart(img.id)}
                            onDragOver={(e) => handleDragOver(e, img.id)}
                            onDrop={(e) => handleDrop(e, img.id)}
                            onDragEnd={() => {
 setDraggingId(null); setDragOverId(null); 
}}
                            className={`
                                relative group rounded-lg border overflow-hidden bg-muted aspect-square cursor-grab
                                transition-all duration-150
                                ${draggingId === img.id ? 'opacity-40 scale-95' : ''}
                                ${dragOverId === img.id && draggingId !== img.id ? 'ring-2 ring-primary' : ''}
                            `}
                        >
                            <img
                                src={img.url}
                                alt="Product"
                                className="h-full w-full object-cover"
                            />

                            {/* Primary badge */}
                            {img.is_primary && (
                                <div className="absolute top-1 left-1">
                                    <Badge className="text-[10px] px-1.5 py-0 bg-yellow-500 text-white border-0">
                                        <Star className="h-2.5 w-2.5 mr-0.5 fill-white" /> Utama
                                    </Badge>
                                </div>
                            )}

                            {/* Drag handle */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 rounded p-0.5">
                                    <GripVertical className="h-3 w-3 text-white" />
                                </div>
                            </div>

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-center gap-1 pb-2 opacity-0 group-hover:opacity-100">
                                {!img.is_primary && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-6 text-[10px] px-2"
                                        onClick={() => handleSetPrimary(img.id)}
                                    >
                                        <Star className="h-2.5 w-2.5 mr-1" /> Utama
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => handleDelete(img.id)}
                                >
                                    <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Tombol tambah gambar */}
                    {sortedImages.length < 10 && (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Upload className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Tambah</span>
                        </button>
                    )}
                </div>
            ) : (
                /* Empty state */
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                    <ImageOff className="h-8 w-8 opacity-40" />
                    <div className="text-center">
                        <p className="text-sm font-medium">Belum ada gambar</p>
                        <p className="text-xs mt-0.5">Klik untuk upload (JPG, PNG, WebP · maks. 2MB per file)</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        <Upload className="h-3 w-3" /> Upload Gambar
                    </div>
                </button>
            )}

            {uploading && (
                <p className="text-xs text-muted-foreground animate-pulse text-center">
                    Mengupload gambar...
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                Maks. 10 gambar · Drag untuk mengubah urutan · Klik bintang untuk set gambar utama
            </p>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

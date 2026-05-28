import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tag } from 'lucide-react';

interface ProductCategory {
    id: string;
    name: string;
    description?: string | null;
}

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: ProductCategory | null;
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
}: CategoryFormDialogProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (open) {
            if (category) {
                setData({
                    name: category.name,
                    description: category.description ?? '',
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [open, category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category) {
            put(`/product-categories/${category.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post('/product-categories', {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {category ? 'Edit Kategori' : 'Tambah Kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {category
                                ? 'Perbarui nama dan deskripsi kategori.'
                                : 'Buat kategori baru untuk mengelompokkan produk.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Nama Kategori <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Minuman, Makanan Ringan, Elektronik..."
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Deskripsi
                            </Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Opsional — keterangan singkat kategori ini..."
                                className="h-20 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : category ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

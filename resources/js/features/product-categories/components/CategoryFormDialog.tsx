import { useForm } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategoryStore } from '@/pages/product-categories/stores/useCategoryStore';

export function CategoryFormDialog() {
    const { isFormOpen, selectedCategory, closeForm } = useCategoryStore();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (isFormOpen) {
            if (selectedCategory) {
                setData({
                    name: selectedCategory.name,
                    description: selectedCategory.description ?? '',
                });
            } else {
                reset();
            }

            clearErrors();
        }
    }, [isFormOpen, selectedCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCategory) {
            put(`/product-categories/${selectedCategory.id}`, {
                onSuccess: () => {
                    closeForm();
                    reset();
                },
            });
        } else {
            post('/product-categories', {
                onSuccess: () => {
                    closeForm();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {selectedCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCategory
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
                        <Button variant="outline" type="button" onClick={closeForm} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : selectedCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

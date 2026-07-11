import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCategoryStore } from '@/pages/product-categories/stores/useCategoryStore';
import { toast } from 'sonner';

export function CategoryDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedCategory: category } = useCategoryStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!category) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        closeDelete(); // Optimistic close

        router.delete(`/product-categories/${category.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Kategori berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus kategori');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Kategori</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <strong className="text-foreground">"{category.name}"</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-2">
                    <Button variant="outline" type="button" onClick={closeDelete} disabled={isDeleting}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDelete}
                    >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Kategori'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

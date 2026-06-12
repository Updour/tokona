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
import { useProductStore } from '@/pages/products/stores/useProductStore';
import { destroy as productsDestroy } from '@/routes/products';

export function ProductDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedProduct: product } = useProductStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!product) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(productsDestroy(product.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Produk</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus produk{' '}
                        <strong className="text-foreground">"{product.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Produk'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

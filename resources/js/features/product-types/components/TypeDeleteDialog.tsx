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
import { useTypeStore } from '@/pages/product-types/stores/useTypeStore';
import { toast } from 'sonner';

export function TypeDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedType: type } = useTypeStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!type) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        closeDelete(); // Optimistic close

        router.delete(`/product-types/${type.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Tipe berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus tipe');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Tipe Produk</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus tipe produk{' '}
                        <strong className="text-foreground">"{type.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Tipe'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
import { usePromoStore } from '@/pages/promos/stores/usePromoStore';

export function PromoDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedPromo: promo } = usePromoStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!promo) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/promos/${promo.id}`, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Promo</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus promo{' '}
                        <strong className="text-foreground">"{promo.name}"</strong>?
                        Promo yang dihapus tidak akan berlaku lagi untuk transaksi.
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Promo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

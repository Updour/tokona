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
import { useCustomerStore } from '@/pages/customers/stores/useCustomerStore';
import { destroy as customersDestroy } from '@/routes/customers';

export function CustomerDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedCustomer: customer } = useCustomerStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!customer) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(customersDestroy(customer.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Pelanggan</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus pelanggan{' '}
                        <strong className="text-foreground">"{customer.name}"</strong>?
                        Tindakan ini tidak dapat dibatalkan dan akan memutus riwayat transaksi terkait.
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pelanggan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

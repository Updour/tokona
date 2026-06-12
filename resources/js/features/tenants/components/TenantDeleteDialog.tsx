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
import { useTenantStore } from '@/pages/tenants/stores/useTenantStore';
import { destroy as tenantsDestroy } from '@/routes/tenants';

export function TenantDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedTenant: tenant } = useTenantStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!tenant) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(tenantsDestroy(tenant.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Tenant</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus tenant{' '}
                        <strong className="text-foreground">"{tenant.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Tenant'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

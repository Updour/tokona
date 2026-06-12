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
import { useUserStore } from '@/pages/users/stores/useUserStore';
import { destroy as usersDestroy } from '@/routes/users';

export function UserDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedUser: user } = useUserStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!user) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(usersDestroy(user.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Akun User</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus akun{' '}
                        <strong className="text-foreground">"{user.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

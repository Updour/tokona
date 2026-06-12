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
import { useBranchStore } from '@/pages/branches/stores/useBranchStore';
import { destroy as branchesDestroy } from '@/routes/branches';

export function BranchDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedBranch: branch } = useBranchStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!branch) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(branchesDestroy(branch.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Cabang</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus cabang{' '}
                        <strong className="text-foreground">"{branch.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Cabang'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

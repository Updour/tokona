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
import { useEmployeeStore } from '@/pages/employees/stores/useEmployeeStore';
import { destroy as employeesDestroy } from '@/routes/employees';

export function EmployeeDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedEmployee: employee } = useEmployeeStore();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!employee) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(employeesDestroy(employee.id).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Karyawan</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus karyawan{' '}
                        <strong className="text-foreground">"{employee.name}"</strong>?
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
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Karyawan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { useForm } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { usePayrollComponentStore } from '../stores/usePayrollComponentStore';

export default function PayrollComponentDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedComponent } = usePayrollComponentStore();
    const { delete: destroy, processing } = useForm();

    const handleConfirm = () => {
        if (selectedComponent) {
            destroy(`/hris/payroll-components/${selectedComponent.id}`, {
                onSuccess: () => {
                    toast.success('Komponen gaji berhasil dihapus!');
                    closeDelete();
                }
            });
        }
    };

    if (!selectedComponent) return null;

    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" /> Hapus Komponen Gaji
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Apakah Anda yakin ingin menghapus komponen <strong>{selectedComponent.name}</strong>? 
                        Komponen ini tidak akan lagi masuk secara otomatis ke slip gaji karyawan bulan depan.
                        Tindakan ini tidak dapat dikembalikan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDelete} disabled={processing}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={handleConfirm} disabled={processing}>
                        {processing ? 'Menghapus...' : 'Ya, Hapus Komponen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

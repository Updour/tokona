import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

import { useForm } from '@inertiajs/react';
import { useMenuStore } from '@/pages/superadmin/Menus/stores/useMenuStore';
import { toast } from 'sonner';

export function MenuDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedMenu } = useMenuStore();
    const { delete: destroy, processing } = useForm();

    const handleConfirm = () => {
        if (selectedMenu) {
            destroy(`/superadmin/menus/${selectedMenu.id}`, {
                onSuccess: () => {
                    toast.success('Menu berhasil dihapus!');
                    closeDelete();
                }
            });
        }
    };

    if (!selectedMenu) return null;
    return (
        <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" /> Hapus Menu
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Apakah Anda yakin ingin menghapus menu <strong>{selectedMenu?.title}</strong>? 
                        {!selectedMenu?.parent_id && " Semua sub-menu di dalamnya juga akan ikut terhapus!"}
                        Tindakan ini tidak dapat dikembalikan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDelete}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={handleConfirm} disabled={processing}>Ya, Hapus Permanen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

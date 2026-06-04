import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export function MenuDeleteDialog({ isOpen, onClose, onConfirm, selectedMenu, processing }: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                    <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={processing}>Ya, Hapus Permanen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

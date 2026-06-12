import { router } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { SalesPerson } from '../types';
import { useSalesStore } from '../stores/useSalesStore';

export function SalesDeleteDialog() {
    const { isDeleteOpen, closeDelete, selectedSales } = useSalesStore();
    const handleDeleteSales = () => {
        if (!selectedSales) {
return;
}

        router.delete(`/sales/destroy/${selectedSales.id}`, {
            onSuccess: () => {
                closeDelete();
            },
        });
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && closeDelete()}>
            <DialogContent className="max-w-md rounded-2xl p-6 border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-650 font-black">
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                        Hapus Sales Representative
                    </DialogTitle>
                    <DialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Menghapus sales representative juga akan menghapus riwayat muatan stok canvas.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 text-xs font-semibold text-slate-600">
                    Apakah Anda yakin ingin menghapus personel sales <strong className="text-slate-800">{selectedSales?.name}</strong> dari sistem?
                </div>

                <DialogFooter className="gap-2 mt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => closeDelete()}
                        className="text-xs font-bold"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleDeleteSales}
                        className="bg-red-600 hover:bg-red-750 text-white text-xs font-extrabold"
                    >
                        Hapus Permanen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

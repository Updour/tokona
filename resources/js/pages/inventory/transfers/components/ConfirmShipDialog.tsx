import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { useTransferStore } from '../stores/useTransferStore';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function ConfirmShipDialog() {
    const { shipTransfer, closeShip } = useTransferStore();
    const isOpen = !!shipTransfer;
    const [processing, setProcessing] = useState(false);

    if (!shipTransfer) return null;

    const handleConfirm = () => {
        setProcessing(true);
        router.put(
            `/inventory/transfers/${shipTransfer.id}/ship`,
            {},
            {
                onSuccess: () => {
                    toast.success('Transfer berhasil dikirim');
                    closeShip();
                },
                onError: () => {
                    toast.error('Gagal mengirim transfer');
                },
                onFinish: () => {
                    setProcessing(false);
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeShip()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-amber-500" />
                        Kirim Transfer Barang
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Apakah Anda yakin ingin mengirim transfer <strong>{shipTransfer.reference_number}</strong>? 
                        <br/><br/>
                        Stok di cabang pengirim akan dikurangi.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={closeShip} disabled={processing}>
                        Batal
                    </Button>
                    <Button onClick={handleConfirm} disabled={processing} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {processing ? 'Memproses...' : 'Ya, Kirim'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

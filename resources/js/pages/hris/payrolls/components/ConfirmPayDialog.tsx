import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePayrollStore } from '../stores/usePayrollStore';

export default function ConfirmPayDialog() {
    const { confirmPayId, closeConfirmPay } = usePayrollStore();
    const [isPaying, setIsPaying] = useState(false);

    const handleMarkAsPaid = () => {
        if (!confirmPayId) return;
        setIsPaying(true);
        router.put(`/hris/payrolls/${confirmPayId}/paid`, {}, {
            onSuccess: () => {
                toast.success('Status gaji berhasil diperbarui menjadi Lunas!');
                closeConfirmPay();
                setIsPaying(false);
            },
            onError: () => {
                toast.error('Terjadi kesalahan, gagal memperbarui status gaji.');
                setIsPaying(false);
            }
        });
    };

    return (
        <Dialog open={!!confirmPayId} onOpenChange={(isOpen) => !isOpen && !isPaying && closeConfirmPay()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        Konfirmasi Pembayaran Gaji
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Apakah Anda yakin ingin menandai slip gaji ini sebagai <span className="font-semibold text-foreground">Lunas</span>? 
                        Tindakan ini akan mengunci slip gaji dan tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={closeConfirmPay}
                        disabled={isPaying}
                    >
                        Batal
                    </Button>
                    <Button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleMarkAsPaid();
                        }}
                        disabled={isPaying}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPaying ? 'Memproses...' : 'Ya, Lunasi Gaji'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

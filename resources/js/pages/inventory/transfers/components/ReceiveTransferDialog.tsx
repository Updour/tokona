import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check, CheckCircle, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTransferStore } from '../stores/useTransferStore';

export default function ReceiveTransferDialog() {
    const { receiveTransfer: transfer, closeReceive } = useTransferStore();
    const isOpen = !!transfer;

    const { data, setData, put, processing, reset } = useForm({
        items: [] as { id: string; received_qty: number }[]
    });

    useEffect(() => {
        if (isOpen && transfer && transfer.items) {
            // Initialize items form state
            const itemsToReceive = transfer.items.map((item: any) => ({
                id: item?.id,
                // Default the input to the remaining quantity to receive
                received_qty: Math.max(0, (item?.shipped_qty || 0) - (item?.received_qty || 0))
            }));
            setData('items', itemsToReceive);
        }
    }, [isOpen, transfer]);

    const handleQtyChange = (itemId: string, val: string) => {
        const qty = parseInt(val);
        setData('items', data.items.map(item => 
            item.id === itemId ? { ...item, received_qty: isNaN(qty) ? 0 : qty } : item
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!transfer?.id) return;

        put(`/inventory/transfers/${transfer.id}/receive`, {
            onSuccess: () => {
                toast.success('Penerimaan berhasil dicatat');
                reset();
                closeReceive();
            },
            onError: () => {
                toast.error('Gagal mencatat penerimaan');
            }
        });
    };

    if (!transfer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeReceive()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Terima Transfer: {transfer.reference_number}</DialogTitle>
                    <DialogDescription>
                        Konfirmasi jumlah barang yang benar-benar diterima (fisik). Anda bisa melakukan penerimaan parsial (sebagian).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border rounded-xl bg-slate-50 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 border-b">
                                <tr>
                                    <th className="text-left py-3 px-4">Produk</th>
                                    <th className="text-center py-3 px-4 w-24">Dikirim</th>
                                    <th className="text-center py-3 px-4 w-24">Terdahulu</th>
                                    <th className="text-center py-3 px-4 w-32">Diterima Saat Ini</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfer?.items?.map((item: any) => {
                                    if (!item) return null;
                                    const formItem = data.items.find(i => i.id === item.id);
                                    const remaining = (item.shipped_qty || 0) - (item.received_qty || 0);
                                    const isComplete = remaining <= 0;

                                    return (
                                        <tr key={item.id} className="border-b last:border-0 bg-white">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-slate-800">{item.product?.name}</div>
                                                <div className="text-xs text-slate-500">{item.product?.sku}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-700">{item.shipped_qty}</td>
                                            <td className="py-3 px-4 text-center text-emerald-600 font-medium">{item.received_qty}</td>
                                            <td className="py-2 px-4 text-center">
                                                {isComplete ? (
                                                    <span className="flex items-center justify-center text-xs font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                                                        <CheckCircle className="w-3 h-3" /> Selesai
                                                    </span>
                                                ) : (
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        max={remaining}
                                                        className="w-full text-center h-8"
                                                        value={formItem?.received_qty ?? ''}
                                                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeReceive}>Batal</Button>
                        <Button type="submit" disabled={processing || data.items.every(i => i.received_qty === 0)}>
                            <CheckCircle className="w-4 h-4 mr-2"/>
                            Konfirmasi Terima
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

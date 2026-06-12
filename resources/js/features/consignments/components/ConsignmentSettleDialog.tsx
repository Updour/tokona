import { useForm, usePage } from '@inertiajs/react';
import { HandCoins, Info } from 'lucide-react';
import * as React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatRupiah , formatNumber} from '@/lib/helpers/format';
import { settle as consignmentsSettle } from '@/routes/consignments';
import { useConsignmentStore } from '../stores/useConsignmentStore';

export function ConsignmentSettleDialog() {
    const { isSettleFormOpen, selectedConsignment, closeSettleForm } = useConsignmentStore();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        total_discount: 0,
        unsold_action: 'rollover',
        items: [] as { item_id: string; qty_received: number; qty_unsold: number; base_cost: number }[]
    });

    useEffect(() => {
        if (!isSettleFormOpen || !selectedConsignment) {
            reset();
            clearErrors();
        } else {
            setData({
                total_discount: 0,
                unsold_action: 'rollover',
                items: selectedConsignment.items?.map((item: any) => ({
                    item_id: item.id,
                    qty_received: item.qty_received,
                    qty_unsold: 0,
                    base_cost: item.base_cost,
                    product_name: item.product?.name,
                })) || []
            });
        }
    }, [isSettleFormOpen, selectedConsignment]);

    const updateItemUnsold = (index: number, val: number) => {
        const newItems = [...data.items];
        // Pastikan sisa tidak lebih dari yang diterima
        const validUnsold = Math.min(Math.max(0, val), newItems[index].qty_received);
        newItems[index].qty_unsold = validUnsold;
        setData('items', newItems);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedConsignment) {
return;
}

        post(consignmentsSettle(selectedConsignment.id).url, {
            onSuccess: () => closeSettleForm(),
        });
    };

    const totalSubtotal = data.items.reduce((acc, curr) => {
        const sold = curr.qty_received - curr.qty_unsold;

        return acc + (sold * curr.base_cost);
    }, 0);

    const netTotal = Math.max(0, totalSubtotal - (data.total_discount || 0));

    return (
        <Dialog open={isSettleFormOpen} onOpenChange={(open) => !open && closeSettleForm()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HandCoins className="h-5 w-5 text-primary" />
                            Setoran Titipan (Settle)
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan sisa fisik barang di rak saat ini. Sistem akan menghitung otomatis tagihan.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Table Input Items */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-slate-50 border-b px-4 py-2 flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase text-slate-700">Perhitungan Fisik</Label>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b">
                                    <tr>
                                        <th className="px-4 py-2">Produk</th>
                                        <th className="px-4 py-2 text-center w-24">Terima</th>
                                        <th className="px-4 py-2 text-center w-32 bg-yellow-50 text-yellow-800 border-x">Sisa di Rak</th>
                                        <th className="px-4 py-2 text-center w-24">Laku</th>
                                        <th className="px-4 py-2 text-right w-32">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item: any, idx: number) => {
                                        const sold = item.qty_received - item.qty_unsold;
                                        const sub = sold * item.base_cost;

                                        return (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                                                <td className="px-4 py-2 font-medium">{item.product_name}</td>
                                                <td className="px-4 py-2 text-center font-mono">{item.qty_received}</td>
                                                <td className="px-2 py-1.5 bg-yellow-50 border-x">
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        max={item.qty_received}
                                                        className="h-7 text-xs font-mono text-center border-yellow-300 focus-visible:ring-yellow-500" 
                                                        value={item.qty_unsold}
                                                        onChange={(e) => updateItemUnsold(idx, parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center font-mono font-bold text-green-700">{sold}</td>
                                                <td className="px-4 py-2 text-right font-mono font-bold">{formatRupiah(sub)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Skema Diskon & Aksi Sisa */}
                    <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                Potongan / Diskon Tambahan
                                <span title="Gunakan ini untuk skema bonus barang (misal: laku 12 diskon setara 2pcs)"><Info className="h-3 w-3" /></span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">Rp</span>
                                <Input 
                                    type="text" 
                                    className="font-mono text-right pl-8"
                                    placeholder="0"
                                    value={data.total_discount === 0 ? '' : formatNumber(data.total_discount)} 
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        setData('total_discount', rawValue ? parseInt(rawValue, 10) : 0);
                                    }} 
                                />
                            </div>
                            {errors.total_discount && <span className="text-xs text-destructive">{errors.total_discount}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tindakan Untuk Sisa Barang</Label>
                            <Select value={data.unsold_action} onValueChange={(v) => setData('unsold_action', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rollover">Titip Ulang (Biarkan di Rak)</SelectItem>
                                    <SelectItem value="return">Ditarik Supplier (Retur/Hapus Stok)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.unsold_action && <span className="text-xs text-destructive">{errors.unsold_action}</span>}
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-lg p-4 flex justify-between items-center shadow-inner">
                        <div>
                            <div className="text-xs font-bold uppercase text-slate-300">Total Bersih Disetor</div>
                            <div className="text-[10px] text-slate-400">Total Kotor {formatRupiah(totalSubtotal)} - Potongan {formatRupiah(data.total_discount)}</div>
                        </div>
                        <div className="text-2xl font-mono font-bold tracking-tight">
                            {formatRupiah(netTotal)}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeSettleForm} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Konfirmasi Setoran'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

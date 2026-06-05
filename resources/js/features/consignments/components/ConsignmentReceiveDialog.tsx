import { useForm, usePage } from '@inertiajs/react';
import { PackagePlus, Plus, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/helpers/format';
import { store as consignmentsStore } from '@/routes/consignments';
import { useConsignmentStore } from '../stores/useConsignmentStore';

export function ConsignmentReceiveDialog() {
    const { isReceiveFormOpen, closeReceiveForm } = useConsignmentStore();
    const { props } = usePage<any>();
    const { auth, suppliers, branches, products } = props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        branch_id: auth?.user?.branch_id || '',
        supplier_id: '',
        notes: '',
        consignment_date: new Date().toISOString().split('T')[0],
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        items: [] as { product_id: string; qty: number; base_cost: number }[]
    });

    useEffect(() => {
        if (!isReceiveFormOpen) {
            reset();
            clearErrors();
        } else {
            // Default 1 item kosong
            if (data.items.length === 0) {
                setData('items', [{ product_id: '', qty: 1, base_cost: 0 }]);
            }
        }
    }, [isReceiveFormOpen]);

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', qty: 1, base_cost: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        (newItems as any)[index][field] = value;
        setData('items', newItems);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(consignmentsStore().url, {
            onSuccess: () => closeReceiveForm(),
        });
    };

    const totalEstValue = data.items.reduce((acc, curr) => acc + ((curr.qty || 0) * (curr.base_cost || 0)), 0);

    return (
        <Dialog open={isReceiveFormOpen} onOpenChange={(open) => !open && closeReceiveForm()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackagePlus className="h-5 w-5 text-primary" />
                            Terima Barang Titipan Baru
                        </DialogTitle>
                        <DialogDescription>
                            Catat barang masuk dari supplier. Stok toko akan otomatis bertambah.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Supplier <span className="text-destructive">*</span></Label>
                            <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Pilih Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers?.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && <span className="text-xs text-destructive">{errors.supplier_id}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Cabang <span className="text-destructive">*</span></Label>
                            <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Pilih Cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches?.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.branch_id && <span className="text-xs text-destructive">{errors.branch_id}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Tanggal Titip <span className="text-destructive">*</span></Label>
                            <Input 
                                type="date" 
                                value={data.consignment_date} 
                                onChange={(e) => setData('consignment_date', e.target.value)} 
                            />
                            {errors.consignment_date && <span className="text-xs text-destructive">{errors.consignment_date}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Jatuh Tempo (Masa Titip)</Label>
                            <Input 
                                type="date" 
                                value={data.due_date} 
                                onChange={(e) => setData('due_date', e.target.value)} 
                            />
                            {errors.due_date && <span className="text-xs text-destructive">{errors.due_date}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Catatan Tambahan</Label>
                        <Textarea
                            placeholder="Catatan dari supplier, nomor surat jalan, dll..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="h-16"
                        />
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-slate-50 border-b px-4 py-2 flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase text-slate-700">Daftar Barang Titipan</Label>
                            <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs flex gap-1 items-center">
                                <Plus className="h-3.5 w-3.5" /> Tambah Baris
                            </Button>
                        </div>
                        <div className="p-4 space-y-3 bg-slate-50/50 max-h-[300px] overflow-y-auto">
                            {data.items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Produk</Label>
                                        <Select value={item.product_id} onValueChange={(v) => {
                                            const prod = products?.find((p: any) => p.id === v);
                                            updateItem(idx, 'product_id', v);

                                            if (prod && !item.base_cost) {
updateItem(idx, 'base_cost', prod.base_price || prod.cost_price || 0);
}
                                        }}>
                                            <SelectTrigger className="h-8 text-xs w-full">
                                                <SelectValue placeholder="Pilih Produk" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products?.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors[`items.${idx}.product_id`] && <span className="text-[10px] text-destructive">{errors[`items.${idx}.product_id`]}</span>}
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Qty (Masuk)</Label>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs font-mono text-center"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Harga Setor/Pcs</Label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-xs text-muted-foreground font-medium">Rp</span>
                                            <Input
                                                type="text"
                                                className="h-8 text-xs font-mono text-right pl-7"
                                                placeholder="0"
                                                value={item.base_cost === 0 ? '' : item.base_cost.toLocaleString('id-ID')}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                    updateItem(idx, 'base_cost', rawValue ? parseInt(rawValue, 10) : 0);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-8 pt-5 text-right">
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {data.items.length === 0 && (
                                <div className="text-center py-4 text-xs text-muted-foreground">Belum ada barang yang ditambahkan.</div>
                            )}
                            {errors.items && <div className="text-xs text-destructive text-center">{errors.items}</div>}
                        </div>
                        <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-t">
                            <span className="text-xs font-bold text-slate-600 uppercase">Estimasi Nilai Titipan</span>
                            <span className="font-mono font-bold text-slate-900">{formatRupiah(totalEstValue)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeReceiveForm} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing || data.items.length === 0}>
                            {processing ? 'Menyimpan...' : 'Simpan Penerimaan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

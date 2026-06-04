import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PromoFormDialog({ open, onOpenChange, promo }: any) {
    const isEditing = !!promo;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'percentage',
        value: 0,
        scope: 'global',
        target_id: '',
        min_qty: 0,
        min_amount: 0,
        start_date: '',
        end_date: '',
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            if (isEditing) {
                setData({
                    name: promo.name || '',
                    type: promo.type || 'percentage',
                    value: promo.value || 0,
                    scope: promo.scope || 'global',
                    target_id: promo.target_id || '',
                    min_qty: promo.min_qty || 0,
                    min_amount: promo.min_amount || 0,
                    start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
                    end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
                    is_active: Boolean(promo.is_active),
                });
            } else {
                reset();
            }
        }
    }, [open, promo]);

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                handleClose();
                toast.success(`Promo berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`);
            },
            onError: () => toast.error('Cek kembali isian form Anda.'),
        };

        if (isEditing) {
            put(`/promos/${promo.id}`, options);
        } else {
            post('/promos', options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen ? handleClose() : onOpenChange(isOpen)}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Diskon' : 'Buat Diskon Baru'}</DialogTitle>
                    <DialogDescription>
                        Aturan ini akan otomatis memotong harga saat Kasir melakukan transaksi.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">

                    {/* Basic Info */}
                    <div className="space-y-2">
                        <Label>Nama Promo / Aturan <span className="text-red-500">*</span></Label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Diskon Grosir Min 1 Lusin" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Diskon Value */}
                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border">
                        <div className="space-y-2">
                            <Label>Tipe Diskon <span className="text-red-500">*</span></Label>
                            <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                                    <SelectItem value="fixed">Nominal Rupiah (Rp)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nilai Potongan <span className="text-red-500">*</span></Label>
                            <Input
                                type="number" step="any" min="0"
                                value={data.value}
                                onChange={(e) => setData('value', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Syarat Minimal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Syarat Min. Qty Barang</Label>
                            <Input type="number" min="0" value={data.min_qty} onChange={(e) => setData('min_qty', parseInt(e.target.value) || 0)} placeholder="0 = Bebas" />
                            <p className="text-[10px] text-muted-foreground">Isi 12 jika syaratnya beli 1 lusin.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Syarat Min. Belanja (Rp)</Label>
                            <Input type="number" min="0" value={data.min_amount} onChange={(e) => setData('min_amount', parseFloat(e.target.value) || 0)} placeholder="0 = Bebas" />
                        </div>
                    </div>

                    {/* Periode */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Berlaku Dari Tgl</Label>
                            <Input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sampai Tgl</Label>
                            <Input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                        </div>
                    </div>

                    {/* Status Aktif */}
                    <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label>Status Aktif</Label>
                            <p className="text-xs text-muted-foreground">Promo yang tidak aktif tidak akan digunakan di kasir.</p>
                        </div>
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(val) => setData('is_active', Boolean(val))}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Promo'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

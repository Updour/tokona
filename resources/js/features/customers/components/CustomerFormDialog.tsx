import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export function CustomerFormDialog({ open, onOpenChange, customer }: any) {
    const isEditing = !!customer;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        tier: 'regular',
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            if (isEditing) {
                setData({
                    name: customer.name || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    address: customer.address || '',
                    tier: customer.tier || 'regular',
                    is_active: Boolean(customer.is_active),
                });
            } else {
                reset();
            }
        }
    }, [open, isEditing, customer]);

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                handleClose();
                toast.success(isEditing ? 'Pelanggan berhasil diperbarui!' : 'Pelanggan berhasil ditambahkan!');
            },
            onError: () => toast.error('Cek kembali isian form Anda.'),
        };

        if (isEditing) {
            put(`/customers/${customer.id}`, options);
        } else {
            post('/customers', options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nama Pelanggan <span className="text-red-500">*</span></Label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nomor HP</Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="08..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="b-address">Alamat Lengkap</Label>
                        <Textarea
                            id="b-address"
                            value={data.address}
                            onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Masukkan alamat lengkap cabang..."
                            rows={3}
                            className="w-full resize-none"
                        />
                    </div>


                    <div className="space-y-2">
                        <Label>Level / Tier <span className="text-red-500">*</span></Label>
                        <Select value={data.tier} onValueChange={(val) => setData('tier', val)}>
                            <SelectTrigger className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="regular">Reguler (Standar)</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="wholesale">Grosir</SelectItem>
                                <SelectItem value="distributor">Distributor</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.tier && <p className="text-xs text-red-500">{errors.tier}</p>}
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label>Status Aktif</Label>
                            <p className="text-xs text-muted-foreground">Pelanggan yang nonaktif tidak dapat melakukan transaksi.</p>
                        </div>
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={val => setData('is_active', Boolean(val))}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Data'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

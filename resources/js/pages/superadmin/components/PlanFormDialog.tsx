import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

interface PlanFormDialogProps {
    plan: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanFormDialog({ plan, isOpen, onClose }: PlanFormDialogProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: 0,
        max_branches: 1,
        max_users: 1,
        max_products: 1,
    });

    useEffect(() => {
        if (plan && isOpen) {
            setData({
                name: plan.name || '',
                description: plan.description || '',
                price: plan.price || 0,
                max_branches: plan.max_branches || 1,
                max_users: plan.max_users || 1,
                max_products: plan.max_products || 1,
            });
        }
    }, [plan, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) return;

        put(`/superadmin/plans/${plan.id}`, {
            onSuccess: () => {
                toast.success('Paket berhasil diperbarui!');
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui paket, periksa input Anda.');
            }
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Edit Batasan: {plan.name}
                        </DialogTitle>
                        <DialogDescription>
                            Ubah konfigurasi limitasi dan harga untuk paket berlangganan ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nama Paket</Label>
                            <div className="col-span-3">
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Deskripsi</Label>
                            <div className="col-span-3">
                                <Input id="description" value={data.description || ''} onChange={e => setData('description', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Harga (Rp)</Label>
                            <div className="col-span-3">
                                <Input id="price" type="number" min="0" value={data.price} onChange={e => setData('price', parseInt(e.target.value) || 0)} />
                                {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="max_branches" className="text-right">Maks. Cabang</Label>
                            <div className="col-span-3">
                                <Input id="max_branches" type="number" min="1" value={data.max_branches} onChange={e => setData('max_branches', parseInt(e.target.value) || 0)} />
                                <span className="text-xs text-muted-foreground">Isi 999999 untuk tanpa batas.</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="max_users" className="text-right">Maks. User</Label>
                            <div className="col-span-3">
                                <Input id="max_users" type="number" min="1" value={data.max_users} onChange={e => setData('max_users', parseInt(e.target.value) || 0)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="max_products" className="text-right">Maks. Produk</Label>
                            <div className="col-span-3">
                                <Input id="max_products" type="number" min="1" value={data.max_products} onChange={e => setData('max_products', parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

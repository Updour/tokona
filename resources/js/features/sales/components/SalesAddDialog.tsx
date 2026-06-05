import { useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

interface SalesAddDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branches: any[];
}

export function SalesAddDialog({ open, onOpenChange, branches = [] }: SalesAddDialogProps) {
    const addForm = useForm({
        branch_id: '',
        name: '',
        phone: '',
        email: '',
        commission_type: 'percent',
        commission_value: '0',
    });

    const handleAddSales = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/sales/store', {
            onSuccess: () => {
                onOpenChange(false);
                addForm.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-lg sm:max-w-lg rounded-2xl p-6 border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-650 text-lg font-black">
                        <Users className="h-5 w-5" />
                        Tambah Sales Lapangan
                    </DialogTitle>
                    <DialogDescription>
                        Daftarkan tenaga sales baru untuk mendistribusikan produk tenant Anda secara kanvas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddSales} className="space-y-4 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="branch_id" className="text-xs font-bold text-slate-700">Cabang Tugas</Label>
                        <Select
                            value={addForm.data.branch_id}
                            onValueChange={val => addForm.setData('branch_id', val)}
                        >
                            <SelectTrigger className="h-10 text-xs font-semibold w-full">
                                <SelectValue placeholder="Pilih Cabang Utama" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {branches.map(b => (
                                    <SelectItem key={b.id} value={b.id} className="text-xs font-semibold">
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {addForm.errors.branch_id && <p className="text-[10px] text-red-500 font-bold">{addForm.errors.branch_id}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-700">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={addForm.data.name}
                            onChange={e => addForm.setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                        {addForm.errors.name && <p className="text-[10px] text-red-500 font-bold">{addForm.errors.name}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-700">No. Telepon / WA</Label>
                        <Input
                            id="phone"
                            value={addForm.data.phone}
                            onChange={e => addForm.setData('phone', e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Kerja</Label>
                        <Input
                            id="email"
                            type="email"
                            value={addForm.data.email}
                            onChange={e => addForm.setData('email', e.target.value)}
                            placeholder="Contoh: budi@tokona.com"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                        {addForm.errors.email && <p className="text-[10px] text-red-500 font-bold">{addForm.errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="commission_type" className="text-xs font-bold text-slate-700">Tipe Komisi</Label>
                            <Select
                                value={addForm.data.commission_type}
                                onValueChange={val => addForm.setData('commission_type', val)}
                            >
                                <SelectTrigger className="h-10 text-xs font-semibold w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent" className="text-xs font-semibold">Persentase (%)</SelectItem>
                                    <SelectItem value="fixed" className="text-xs font-semibold">Nominal Tetap (Rp)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="commission_value" className="text-xs font-bold text-slate-700">Nilai Komisi</Label>
                            <Input
                                id="commission_value"
                                type="number"
                                min="0"
                                value={addForm.data.commission_value}
                                onChange={e => addForm.setData('commission_value', e.target.value)}
                                placeholder="Contoh: 5"
                                className="h-10 text-xs font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-10 mt-2 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs" disabled={addForm.processing}>
                        {addForm.processing && <Spinner className="mr-2" />}
                        Daftarkan Personel Sales
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SalesPerson } from '../types';

interface SalesEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedSales: SalesPerson | null;
    branches: any[];
}

export function SalesEditDialog({ open, onOpenChange, selectedSales, branches = [] }: SalesEditDialogProps) {
    const editForm = useForm({
        branch_id: '',
        name: '',
        phone: '',
        email: '',
        commission_type: 'percent',
        commission_value: '0',
    });

    useEffect(() => {
        if (selectedSales) {
            editForm.setData({
                branch_id: selectedSales.branch_id || '',
                name: selectedSales.name || '',
                phone: selectedSales.phone || '',
                email: selectedSales.email || '',
                commission_type: selectedSales.commission_type || 'percent',
                commission_value: String(selectedSales.commission_value || '0'),
            });
        }
    }, [selectedSales, open]);

    const handleEditSales = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSales) return;
        editForm.put(`/sales/update/${selectedSales.id}`, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-lg sm:max-w-lg rounded-2xl p-6 border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-655 font-black text-lg">
                        <Pencil className="h-5 w-5 text-indigo-600" />
                        Edit Sales Representative
                    </DialogTitle>
                    <DialogDescription>
                        Perbarui profil dan skema komisi kerja sales representative terpilih.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleEditSales} className="space-y-4 py-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="edit_branch_id" className="text-xs font-bold text-slate-700">Cabang Tugas</Label>
                        <Select
                            value={editForm.data.branch_id}
                            onValueChange={val => editForm.setData('branch_id', val)}
                        >
                            <SelectTrigger className="h-10 text-xs font-semibold">
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
                        {editForm.errors.branch_id && <p className="text-[10px] text-red-500 font-bold">{editForm.errors.branch_id}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="edit_name" className="text-xs font-bold text-slate-700">Nama Lengkap</Label>
                        <Input
                            id="edit_name"
                            value={editForm.data.name}
                            onChange={e => editForm.setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                        {editForm.errors.name && <p className="text-[10px] text-red-500 font-bold">{editForm.errors.name}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="edit_phone" className="text-xs font-bold text-slate-700">No. Telepon / WA</Label>
                        <Input
                            id="edit_phone"
                            value={editForm.data.phone}
                            onChange={e => editForm.setData('phone', e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="edit_email" className="text-xs font-bold text-slate-700">Email Kerja</Label>
                        <Input
                            id="edit_email"
                            type="email"
                            value={editForm.data.email}
                            onChange={e => editForm.setData('email', e.target.value)}
                            placeholder="Contoh: budi@tokona.com"
                            className="h-10 text-xs font-semibold"
                            required
                        />
                        {editForm.errors.email && <p className="text-[10px] text-red-500 font-bold">{editForm.errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="edit_commission_type" className="text-xs font-bold text-slate-700">Tipe Komisi</Label>
                            <Select
                                value={editForm.data.commission_type}
                                onValueChange={val => editForm.setData('commission_type', val)}
                            >
                                <SelectTrigger className="h-10 text-xs font-semibold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent" className="text-xs font-semibold">Persentase (%)</SelectItem>
                                    <SelectItem value="fixed" className="text-xs font-semibold">Nominal Tetap (Rp)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="edit_commission_value" className="text-xs font-bold text-slate-700">Nilai Komisi</Label>
                            <Input
                                id="edit_commission_value"
                                type="number"
                                min="0"
                                value={editForm.data.commission_value}
                                onChange={e => editForm.setData('commission_value', e.target.value)}
                                placeholder="Contoh: 5"
                                className="h-10 text-xs font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-10 mt-2 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs" disabled={editForm.processing}>
                        {editForm.processing && <Spinner className="mr-2" />}
                        Simpan Perubahan
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

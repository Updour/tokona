import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayrollComponentStore } from '../stores/usePayrollComponentStore';

export default function PayrollComponentFormDialog() {
    const { isFormOpen, closeForm, selectedComponent } = usePayrollComponentStore();
    const { is_super_admin, tenants = [] } = usePage<any>().props;
    const isEdit = !!selectedComponent;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'allowance',
        amount: '',
        is_taxable: false,
        tenant_id: '',
    });

    useEffect(() => {
        if (isFormOpen) {
            if (isEdit) {
                setData({
                    name: selectedComponent.name,
                    type: selectedComponent.type,
                    amount: selectedComponent.amount,
                    is_taxable: selectedComponent.is_taxable,
                    tenant_id: selectedComponent.tenant_id || '',
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isFormOpen, selectedComponent]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                toast.success(`Komponen gaji berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
                closeForm();
            }
        };

        if (isEdit) {
            put(`/hris/payroll-components/${selectedComponent.id}`, options);
        } else {
            post('/hris/payroll-components', options);
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={closeForm}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Komponen Gaji' : 'Tambah Komponen Baru'}</DialogTitle>
                    <DialogDescription>
                        Atur nilai default untuk tunjangan atau potongan gaji.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    {is_super_admin && (
                        <div className="space-y-2">
                            <Label htmlFor="tenant_id">Tenant (Toko) <span className="text-red-500">*</span></Label>
                            <Select value={data.tenant_id} onValueChange={(val) => setData('tenant_id', val)} disabled={isEdit}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants?.map((tenant: any) => (
                                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tenant_id && <p className="text-xs text-red-500">{errors.tenant_id}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Komponen <span className="text-red-500">*</span></Label>
                        <Input 
                            id="name" 
                            placeholder="Contoh: Uang Makan, BPJS Ketenagakerjaan" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipe <span className="text-red-500">*</span></Label>
                            <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="allowance">Tunjangan (+)</SelectItem>
                                    <SelectItem value="deduction">Potongan (-)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Nominal (Rp) <span className="text-red-500">*</span></Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                value={data.amount} 
                                onChange={e => setData('amount', e.target.value)} 
                            />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_taxable">Kena Pajak PPh 21?</Label>
                            <p className="text-xs text-muted-foreground">
                                Aktifkan jika komponen ini masuk ke perhitungan pajak.
                            </p>
                        </div>
                        <input 
                            type="checkbox"
                            id="is_taxable" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.is_taxable} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_taxable', e.target.checked)} 
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={closeForm} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Komponen')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

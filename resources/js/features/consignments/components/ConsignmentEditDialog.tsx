import { useForm, usePage } from '@inertiajs/react';
import { PackageOpen } from 'lucide-react';
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
import { useConsignmentStore } from '../stores/useConsignmentStore';

export function ConsignmentEditDialog() {
    const { isEditFormOpen, closeEditForm, selectedConsignmentEdit: consignment } = useConsignmentStore();
    const { props } = usePage<any>();
    const { suppliers, branches } = props;

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        supplier_id: '',
        branch_id: '',
        notes: '',
        consignment_date: '',
        due_date: '',
    });

    // Isi form saat dialog dibuka dengan data consignment yang ada
    useEffect(() => {
        if (isEditFormOpen && consignment) {
            setData({
                supplier_id: consignment.supplier?.id || consignment.supplier_id || '',
                branch_id: consignment.branch?.id || consignment.branch_id || '',
                notes: consignment.notes || '',
                consignment_date: consignment.consignment_date
                    ? consignment.consignment_date.substring(0, 10)
                    : (consignment.created_at ? consignment.created_at.substring(0, 10) : ''),
                due_date: consignment.due_date ? consignment.due_date.substring(0, 10) : '',
            });
        }
        if (!isEditFormOpen) {
            reset();
            clearErrors();
        }
    }, [isEditFormOpen, consignment]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/consignments/${consignment?.id}`, {
            onSuccess: () => closeEditForm(),
        });
    };

    if (!consignment) return null;

    return (
        <Dialog open={isEditFormOpen} onOpenChange={(open) => !open && closeEditForm()}>
            <DialogContent className="sm:max-w-[540px]">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackageOpen className="h-5 w-5 text-amber-600" />
                            Edit Barang Titipan
                        </DialogTitle>
                        <DialogDescription>
                            Ubah informasi header barang titipan. Detail item tidak dapat diubah setelah penerimaan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Supplier <span className="text-destructive">*</span>
                            </Label>
                            <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                <SelectTrigger className="w-full">
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
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Cabang <span className="text-destructive">*</span>
                            </Label>
                            <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                <SelectTrigger className="w-full">
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
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Tanggal Titip <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.consignment_date}
                                onChange={(e) => setData('consignment_date', e.target.value)}
                            />
                            {errors.consignment_date && <span className="text-xs text-destructive">{errors.consignment_date}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Jatuh Tempo</Label>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeEditForm} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-amber-600 hover:bg-amber-700 text-white">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

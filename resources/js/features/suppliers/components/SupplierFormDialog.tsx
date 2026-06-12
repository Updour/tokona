import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupplierStore } from '@/pages/suppliers/stores/useSupplierStore';

export function SupplierFormDialog() {
    const { isFormOpen, selectedSupplier: supplier, closeForm } = useSupplierStore();
    const { data, setData, post, put, processing, reset, clearErrors, errors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        status: 'active'
    });

    useEffect(() => {
        if (isFormOpen) {
            clearErrors();

            if (supplier) {
                setData({
                    name: supplier.name || '',
                    contact_person: supplier.contact_person || '',
                    phone: supplier.phone || '',
                    email: supplier.email || '',
                    address: supplier.address || '',
                    status: supplier.status || 'active',
                });
            } else {
                reset();
            }
        }
    }, [isFormOpen, supplier]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (supplier) {
            put(`/suppliers/${supplier.id}`, {
                onSuccess: () => {
                    toast.success('Data supplier berhasil diperbarui!');
                    closeForm();
                }
            });
        } else {
            post('/suppliers', {
                onSuccess: () => {
                    toast.success('Data supplier berhasil disimpan!');
                    reset();
                    closeForm();
                }
            });
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{supplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
                        <DialogDescription>
                            {supplier ? 'Ubah informasi data pemasok ini. Klik simpan setelah selesai.' : 'Masukkan informasi pemasok barang Anda. Klik simpan setelah selesai.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Perusahaan / Toko <span className="text-red-500">*</span></Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Kontak</Label>
                                <Input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>No. Telepon / HP</Label>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Alamat Lengkap</Label>
                            <Textarea value={data.address} onChange={e => setData('address', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status <span className="text-red-500">*</span></Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeForm}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? (supplier ? 'Memperbarui...' : 'Menyimpan...')
                                : (supplier ? 'Simpan Perubahan' : 'Simpan Data')
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

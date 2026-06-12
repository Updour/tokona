import { useForm } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTypeStore } from '@/pages/product-types/stores/useTypeStore';

export function TypeFormDialog() {
    const { isFormOpen, selectedType, closeForm } = useTypeStore();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (isFormOpen) {
            if (selectedType) {
                setData({
                    name: selectedType.name,
                    description: selectedType.description ?? '',
                });
            } else {
                reset();
            }

            clearErrors();
        }
    }, [isFormOpen, selectedType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedType) {
            put(`/product-types/${selectedType.id}`, {
                onSuccess: () => {
                    closeForm();
                    reset();
                },
            });
        } else {
            post('/product-types', {
                onSuccess: () => {
                    closeForm();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            {selectedType ? 'Edit Tipe Produk' : 'Tambah Tipe Produk'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedType
                                ? 'Perbarui nama dan deskripsi tipe produk.'
                                : 'Buat tipe baru untuk mengklasifikasikan produk Anda.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Nama Tipe <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Barang, Jasa, Paket, Digital..."
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Deskripsi
                            </Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Opsional — keterangan singkat tipe ini..."
                                className="h-20 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={closeForm} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : selectedType ? 'Simpan Perubahan' : 'Tambah Tipe'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

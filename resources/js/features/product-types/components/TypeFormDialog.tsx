import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Layers } from 'lucide-react';

interface ProductType {
    id: string;
    name: string;
    description?: string | null;
}

interface TypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: ProductType | null;
}

export function TypeFormDialog({
    open,
    onOpenChange,
    type,
}: TypeFormDialogProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (open) {
            if (type) {
                setData({
                    name: type.name,
                    description: type.description ?? '',
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [open, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (type) {
            put(`/product-types/${type.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post('/product-types', {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            {type ? 'Edit Tipe Produk' : 'Tambah Tipe Produk'}
                        </DialogTitle>
                        <DialogDescription>
                            {type
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
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : type ? 'Simpan Perubahan' : 'Tambah Tipe'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

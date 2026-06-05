import { useForm } from '@inertiajs/react';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/helpers/format';

export function OpenShiftDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({ opening_balance: '', notes: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/shifts/open', {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlayCircle className="h-4 w-4" /> Buka Shift
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Buka Shift Kasir</DialogTitle>
                        <DialogDescription>
                            Hitung saldo awal di laci kas lalu masukkan di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="opening_balance">Saldo Awal (Rp)</Label>
                            <Input
                                id="opening_balance"
                                type="text"
                                // Ditambahkan class text-xl (teks besar) dan h-12 (tinggi input lebih besar)
                                className="text-5xl font-semibold h-12 py-3"
                                value={formatRupiah(form.data.opening_balance.toString())}
                                onChange={e => form.setData('opening_balance', e.target.value.replace(/\D/g, ''))}
                                placeholder="Contoh: 200.000"
                                autoFocus
                            />

                            {form.errors.opening_balance && (
                                <p className="text-sm text-red-500">{form.errors.opening_balance}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={e => form.setData('notes', e.target.value)}
                                placeholder="Catatan tambahan..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner className="mr-2" />}
                            Buka Shift Sekarang
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

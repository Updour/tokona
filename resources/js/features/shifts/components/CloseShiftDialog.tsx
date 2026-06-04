import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatRupiah } from '@/lib/helpers/format';
import type { Shift } from '../types';

interface Props {
    shift: Shift;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CloseShiftDialog({ shift, open, onOpenChange }: Props) {
    const form = useForm({ closing_balance: '', notes: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/shifts/${shift.id}/close`, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Tutup Shift Kasir</DialogTitle>
                        <DialogDescription>
                            Hitung uang di laci kas lalu masukkan saldo akhir.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Saldo Awal:</span>
                                <span className="font-medium">{formatRupiah(shift.opening_balance)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dibuka:</span>
                                <span>{new Date(shift.opened_at).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="closing_balance">Saldo Akhir di Laci Kas (Rp)</Label>
                            <Input
                                id="closing_balance"
                                type="number"
                                min="0"
                                value={form.data.closing_balance}
                                onChange={e => form.setData('closing_balance', e.target.value)}
                                placeholder="Contoh: 350000"
                                autoFocus
                            />
                            {form.errors.closing_balance && (
                                <p className="text-sm text-red-500">{form.errors.closing_balance}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="close_notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="close_notes"
                                value={form.data.notes}
                                onChange={e => form.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={form.processing}>
                            {form.processing && <Spinner className="mr-2" />}
                            Tutup Shift
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

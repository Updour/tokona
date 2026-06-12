import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';

import { useShiftStore } from '@/pages/shifts/stores/useShiftStore';

export function CloseShiftDialog() {
    const { isCloseOpen, closeClose, selectedShift: shift } = useShiftStore();
    const form = useForm({ closing_balance: '', notes: '' });

    if (!shift) return null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/shifts/${shift.id}/close`, {
            onSuccess: () => closeClose(),
        });
    };

    return (
        <Dialog open={isCloseOpen} onOpenChange={closeClose}>
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
                                <span>{formatDateTime(shift.opened_at)}</span>
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

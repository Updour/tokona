import { useState, useEffect } from 'react';
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
import { Calculator } from 'lucide-react';

import { useShiftStore } from '@/pages/shifts/stores/useShiftStore';

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

export function CloseShiftDialog() {
    const { isCloseOpen, closeClose, selectedShift: shift } = useShiftStore();
    const form = useForm({ closing_balance: '', notes: '' });
    
    const [useCalculator, setUseCalculator] = useState(false);
    const [denominations, setDenominations] = useState<Record<number, number | ''>>({});

    useEffect(() => {
        if (!isCloseOpen) {
            form.reset();
            setUseCalculator(false);
            setDenominations({});
        }
    }, [isCloseOpen]);

    useEffect(() => {
        if (useCalculator) {
            let total = 0;
            Object.entries(denominations).forEach(([nominal, qty]) => {
                total += Number(nominal) * (Number(qty) || 0);
            });
            form.setData('closing_balance', total.toString());
        }
    }, [denominations, useCalculator]);

    if (!shift) return null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/shifts/${shift.id}/close`, {
            onSuccess: () => closeClose(),
        });
    };

    const getDuration = () => {
        if (!shift?.opened_at) return '';
        const diff = new Date().getTime() - new Date(shift.opened_at).getTime();
        if (diff < 0) return '';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours} Jam ${minutes} Menit`;
    };

    const handleDenominationChange = (nominal: number, value: string) => {
        const qty = value === '' ? '' : parseInt(value.replace(/\D/g, ''), 10);
        setDenominations(prev => ({ ...prev, [nominal]: qty }));
    };

    return (
        <Dialog open={isCloseOpen} onOpenChange={closeClose}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Tutup Shift Kasir</DialogTitle>
                        <DialogDescription>
                            Hitung uang fisik di laci kas lalu masukkan saldo akhir.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="p-3 rounded-lg bg-slate-50 border text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Uang Modal (Awal):</span>
                                <span className="font-bold">{formatRupiah(shift.opening_balance)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Waktu Dibuka:</span>
                                <span className="font-bold">{formatDateTime(shift.opened_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Durasi Kerja:</span>
                                <span className="font-bold text-indigo-700">{getDuration()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <Label htmlFor="closing_balance" className="text-base font-bold text-indigo-700">Total Uang di Laci</Label>
                            <Button 
                                type="button" 
                                variant={useCalculator ? "default" : "outline"} 
                                size="sm" 
                                onClick={() => setUseCalculator(!useCalculator)}
                                className={useCalculator ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                            >
                                <Calculator className="h-4 w-4 mr-2" /> Kalkulator Pecahan
                            </Button>
                        </div>

                        {useCalculator && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-2 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {DENOMINATIONS.map((nominal) => (
                                        <div key={nominal} className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-slate-700 w-20">{formatRupiah(nominal)}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">x</span>
                                                <Input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    className="w-16 h-8 text-center" 
                                                    placeholder="0"
                                                    value={denominations[nominal] ?? ''}
                                                    onChange={(e) => handleDenominationChange(nominal, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Input
                                id="closing_balance"
                                type="text"
                                className={`text-4xl font-black h-16 text-center ${useCalculator ? 'bg-indigo-50/50 border-indigo-200 text-indigo-800' : 'text-slate-800'}`}
                                value={form.data.closing_balance ? formatRupiah(form.data.closing_balance.toString()) : ''}
                                onChange={e => {
                                    if (!useCalculator) {
                                        form.setData('closing_balance', e.target.value.replace(/\D/g, ''));
                                    }
                                }}
                                placeholder="Rp 0"
                                readOnly={useCalculator}
                                autoFocus={!useCalculator}
                            />
                            {form.errors.closing_balance && (
                                <p className="text-sm text-red-500">{form.errors.closing_balance}</p>
                            )}
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="close_notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="close_notes"
                                placeholder="Tulis catatan jika ada selisih uang..."
                                value={form.data.notes}
                                onChange={e => form.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={form.processing}>
                            {form.processing ? <Spinner className="mr-2" /> : null}
                            Konfirmasi & Tutup Shift
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

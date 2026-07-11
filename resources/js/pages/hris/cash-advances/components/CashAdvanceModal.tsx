import { useForm } from '@inertiajs/react';
import React from 'react';
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
import { useCashAdvanceStore } from '@/stores/useCashAdvanceStore';

export function CashAdvanceModal({ employees }: { employees: any[] }) {
    const { isAddModalOpen, setAddModalOpen } = useCashAdvanceStore();

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        reason: '',
    });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hris/cash-advances', {
            onSuccess: () => {
                setAddModalOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submitAdd}>
                    <DialogHeader>
                        <DialogTitle>Catat Kasbon Baru</DialogTitle>
                        <DialogDescription>
                            Uang kasbon akan memotong saldo Laci Kasir secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user">Karyawan</Label>
                            <Select
                                value={data.user_id}
                                onValueChange={(val) => setData('user_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Karyawan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp: any) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.user_id && <span className="text-xs text-red-500">{errors.user_id}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Tanggal Pinjam</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                            />
                            {errors.date && <span className="text-xs text-red-500">{errors.date}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Nominal Pinjaman (Rp)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Contoh: 500000"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            {errors.amount && <span className="text-xs text-red-500">{errors.amount}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Keperluan</Label>
                            <Textarea
                                id="reason"
                                placeholder="Keperluan kasbon..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                            />
                            {errors.reason && <span className="text-xs text-red-500">{errors.reason}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                            {processing ? 'Menyimpan...' : 'Simpan & Keluarkan Uang'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

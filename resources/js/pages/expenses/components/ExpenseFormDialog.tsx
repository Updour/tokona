import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Landmark, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useExpenseStore } from '../stores/useExpenseStore';

interface Props {
    branches: any[];
}

export const expenseCategories = [
    { value: 'utilitas', label: 'Utilitas & Tagihan (Listrik/Air)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'sewa', label: 'Sewa Tempat / Ruko', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'gaji', label: 'Gaji Karyawan & Staff', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'pemasaran', label: 'Pemasaran & Iklan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'operasional', label: 'Operasional Toko', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { value: 'lainnya', label: 'Lain-lain', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export function ExpenseFormDialog({ branches }: Props) {
    const { isFormOpen, selectedExpense, closeForm } = useExpenseStore();
    const isEditing = !!selectedExpense;

    const { data, setData, post, put, processing, reset } = useForm({
        branch_id: '',
        title: '',
        amount: '',
        category: 'operasional',
        note: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isFormOpen) {
            if (isEditing && selectedExpense) {
                setData({
                    branch_id: selectedExpense.branch_id || (branches[0]?.id || ''),
                    title: selectedExpense.title || '',
                    amount: String(Number(selectedExpense.amount || 0)),
                    category: selectedExpense.category || 'operasional',
                    note: selectedExpense.note || '',
                    expense_date: selectedExpense.expense_date ? selectedExpense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0]
                });
            } else {
                setData({
                    branch_id: branches[0]?.id || '',
                    title: '',
                    amount: '',
                    category: 'operasional',
                    note: '',
                    expense_date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [isFormOpen, selectedExpense, branches]);

    const handleClose = () => {
        reset();
        closeForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.title || !data.amount || !data.branch_id) {
            toast.error('Harap isi semua kolom wajib!');
            return;
        }

        const options = {
            onSuccess: () => {
                handleClose();
                toast.success(isEditing ? 'Catatan pengeluaran berhasil diperbarui!' : 'Pengeluaran baru berhasil dicatat!');
            },
        };

        if (isEditing && selectedExpense) {
            put(`/expenses/${selectedExpense.id}`, options);
        } else {
            post('/expenses', options);
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" />
                        {isEditing ? 'Ubah Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        Pastikan data pengeluaran diisi dengan benar agar pembukuan kas & laporan laba rugi terhitung akurat.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="branch_id">Cabang Toko <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.branch_id}
                            onValueChange={(val) => setData('branch_id', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches?.map((b: any) => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="category">Kategori Pengeluaran <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.category}
                            onValueChange={(val) => setData('category', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseCategories.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="title">Deskripsi Singkat <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="Contoh: Bayar air PAM Mei, Pembelian ATK"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="amount">Jumlah Uang (Rp) <span className="text-red-500">*</span></Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                placeholder="Nominal"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="expense_date">Tanggal Pengeluaran <span className="text-red-500">*</span></Label>
                            <Input
                                id="expense_date"
                                type="date"
                                value={data.expense_date}
                                onChange={(e) => setData('expense_date', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">Catatan / Keterangan (Opsional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Tambahkan informasi pelengkap di sini..."
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 text-[10px] text-muted-foreground border">
                        <Info className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                            Pengeluaran yang dicatat di sini otomatis akan memotong saldo kas toko serta diperhitungkan di dalam laporan Laba Rugi akhir.
                        </span>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>Batal</Button>
                        <Button type="submit" className="bg-primary" disabled={processing}>
                            {isEditing ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

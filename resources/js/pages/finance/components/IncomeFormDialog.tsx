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
import { useIncomeStore } from '../stores/useIncomeStore';

interface Props {
    branches: any[];
}

export const incomeCategories = [
    { value: 'penjualan', label: 'Penjualan POS / Kasir', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'modal', label: 'Suntikan Modal Usaha', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'piutang_lunas', label: 'Pelunasan Piutang Pelanggan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'lainnya', label: 'Pemasukan Lainnya', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export function IncomeFormDialog({ branches }: Props) {
    const { isFormOpen, closeForm } = useIncomeStore();

    const { data, setData, post, processing, reset } = useForm({
        branch_id: '',
        amount: '',
        category: 'lainnya',
        note: ''
    });

    useEffect(() => {
        if (isFormOpen) {
            setData({
                branch_id: branches[0]?.id || '',
                amount: '',
                category: 'lainnya',
                note: ''
            });
        }
    }, [isFormOpen, branches]);

    const handleClose = () => {
        reset();
        closeForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.amount || !data.note || !data.branch_id) {
            toast.error('Harap isi semua kolom wajib!');
            return;
        }

        post('/incomes', {
            onSuccess: () => {
                handleClose();
                toast.success('Pemasukan baru berhasil dicatat!');
            }
        });
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" /> Catat Pemasukan Manual
                    </DialogTitle>
                    <DialogDescription>
                        Gunakan ini untuk mencatat kas masuk non-penjualan seperti suntikan modal pemegang saham atau pelunasan hutang pihak ketiga.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="branch_id">Cabang Penerima <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="category">Kategori Pemasukan <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.category}
                            onValueChange={(val) => setData('category', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {incomeCategories.filter(c => c.value !== 'penjualan').map((c) => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Jumlah Uang Masuk (Rp) <span className="text-red-500">*</span></Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            placeholder="Nominal Rp"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">Keterangan / Sumber Dana <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="note"
                            placeholder="Contoh: Suntikan Modal Owner untuk beli kulkas baru"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <div className="flex gap-2 p-2.5 rounded-lg bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-100">
                        <Info className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>
                            Setoran kas masuk manual ini otomatis akan menambah total saldo rekening dan kas cabang toko yang dipilih.
                        </span>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>Batal</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={processing}>
                            Simpan Pemasukan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

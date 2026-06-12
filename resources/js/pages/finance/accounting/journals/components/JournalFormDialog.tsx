import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJournalStore, JournalEntryInput } from '../stores/useJournalStore';
import { formatRupiah, getTodayDateString } from '@/lib/helpers/format';
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';

export default function JournalFormDialog({ accounts, branches, isSuperAdmin }: any) {
    const { isFormOpen, closeForm } = useJournalStore();
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        date: getTodayDateString(),
        description: '',
        branch_id: '',
        reference_number: '',
        entries: [
            { id: '1', account_id: '', debit: '', credit: '0', description: '' },
            { id: '2', account_id: '', debit: '0', credit: '', description: '' },
        ] as JournalEntryInput[]
    });

    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);

    useEffect(() => {
        let tDebit = 0;
        let tCredit = 0;
        data.entries.forEach(entry => {
            tDebit += Number(entry.debit) || 0;
            tCredit += Number(entry.credit) || 0;
        });
        setTotalDebit(tDebit);
        setTotalCredit(tCredit);
    }, [data.entries]);

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const addEntry = () => {
        setData('entries', [
            ...data.entries,
            { id: Math.random().toString(36).substr(2, 9), account_id: '', debit: '', credit: '', description: '' }
        ]);
    };

    const removeEntry = (id: string) => {
        if (data.entries.length <= 2) return;
        setData('entries', data.entries.filter(e => e.id !== id));
    };

    const updateEntry = (id: string, field: keyof JournalEntryInput, value: any) => {
        setData('entries', data.entries.map(e => {
            if (e.id === id) {
                const newEntry = { ...e, [field]: value };
                // Ensure only one side has value, other is 0 (optional UX improvement)
                if (field === 'debit' && value > 0) newEntry.credit = '0';
                if (field === 'credit' && value > 0) newEntry.debit = '0';
                return newEntry;
            }
            return e;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isBalanced) {
            toast.error('Total Debit dan Kredit harus seimbang!');
            return;
        }

        post('/finance/accounting/journals', {
            onSuccess: () => {
                closeForm();
                reset();
            },
        });
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={closeForm}>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Tambah Jurnal Manual
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan data jurnal *double-entry*. Pastikan total Debit sama dengan Kredit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Tanggal Transaksi</Label>
                            <Input 
                                type="date" 
                                value={data.date} 
                                onChange={e => setData('date', e.target.value)} 
                                required
                            />
                            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label>No. Referensi (Opsional)</Label>
                            <Input 
                                placeholder="JNL-AUTO-GEN" 
                                value={data.reference_number} 
                                onChange={e => setData('reference_number', e.target.value)} 
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label>Deskripsi Jurnal</Label>
                            <Input 
                                placeholder="Cth: Penyesuaian penyusutan aset bulan ini" 
                                value={data.description} 
                                onChange={e => setData('description', e.target.value)} 
                                required
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>

                        {isSuperAdmin && (
                            <div className="space-y-1.5 md:col-span-2">
                                <Label>Cabang (Opsional)</Label>
                                <Select value={data.branch_id} onValueChange={v => setData('branch_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Cabang (Biarkan kosong jika Pusat)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Pusat / Tidak Spesifik</SelectItem>
                                        {branches?.map((b: any) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="border rounded-lg shadow-sm">
                        <div className="bg-slate-50 p-3 border-b flex justify-between items-center rounded-t-lg">
                            <h3 className="font-bold text-sm text-slate-700">Baris Entri Akun</h3>
                            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={addEntry}>
                                <Plus className="h-3.5 w-3.5" /> Tambah Baris
                            </Button>
                        </div>
                        
                        <div className="p-3 space-y-3">
                            {data.entries.map((entry, index) => (
                                <div key={entry.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center relative p-3 border rounded bg-white">
                                    <div className="flex-1 min-w-[200px] w-full">
                                        <Label className="text-xs mb-1 block">Akun Perkiraan</Label>
                                        <Select value={entry.account_id} onValueChange={v => updateEntry(entry.id, 'account_id', v)} required>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Pilih Akun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts?.map((acc: any) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        <span className="font-mono text-muted-foreground mr-2">{acc.code}</span>
                                                        {acc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-[150px]">
                                        <Label className="text-xs mb-1 block">Debit (Rp)</Label>
                                        <Input 
                                            type="number" 
                                            className="h-9 text-xs text-right"
                                            value={entry.debit}
                                            onChange={e => updateEntry(entry.id, 'debit', e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                    <div className="w-full sm:w-[150px]">
                                        <Label className="text-xs mb-1 block">Kredit (Rp)</Label>
                                        <Input 
                                            type="number" 
                                            className="h-9 text-xs text-right"
                                            value={entry.credit}
                                            onChange={e => updateEntry(entry.id, 'credit', e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 mt-5 self-end sm:self-auto shrink-0"
                                        onClick={() => removeEntry(entry.id)}
                                        disabled={data.entries.length <= 2}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {errors.entries && <p className="text-xs text-red-500">{errors.entries}</p>}
                        </div>

                        <div className="bg-slate-100 p-4 rounded-b-lg border-t grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium text-xs uppercase">Total Debit</span>
                                <span className={`font-mono font-bold text-lg ${isBalanced ? 'text-slate-800' : 'text-blue-600'}`}>
                                    {formatRupiah(totalDebit)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium text-xs uppercase">Total Kredit</span>
                                <span className={`font-mono font-bold text-lg ${isBalanced ? 'text-slate-800' : 'text-blue-600'}`}>
                                    {formatRupiah(totalCredit)}
                                </span>
                            </div>
                            <div className="flex flex-col sm:items-end justify-center">
                                {!isBalanced ? (
                                    <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-100 px-3 py-1.5 rounded-full text-xs">
                                        <AlertCircle className="h-4 w-4" />
                                        Selisih: {formatRupiah(Math.abs(totalDebit - totalCredit))}
                                    </div>
                                ) : (
                                    <div className="text-emerald-600 font-bold bg-emerald-100 px-4 py-1.5 rounded-full text-xs text-center border border-emerald-200">
                                        Seimbang (Balanced) ✓
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                        <Button type="submit" disabled={processing || !isBalanced} className="gap-2">
                            <BookOpen className="h-4 w-4" /> Simpan Jurnal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

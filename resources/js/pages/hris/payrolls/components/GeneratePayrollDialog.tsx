import { router } from '@inertiajs/react';
import { Calculator, X, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatRupiah } from '@/lib/helpers/format';
import { usePayrollStore } from '../stores/usePayrollStore';

interface Props {
    employees: any[];
}

export default function GeneratePayrollDialog({ employees }: Props) {
    const { isGenerateOpen, closeGenerate } = usePayrollStore();

    const [userId, setUserId] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [allowances, setAllowances] = useState<{ name: string, amount: string }[]>([]);
    const [deductions, setDeductions] = useState<{ name: string, amount: string }[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Calculate dynamic net salary based on selected user
    const selectedEmployeeSalary = employees?.find((e: any) => e.id === userId)?.employee_salary?.basic_salary || 0;
    const totalAllowances = allowances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const dynamicNetSalary = Number(selectedEmployeeSalary) + totalAllowances - totalDeductions;

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        router.post('/hris/payrolls/generate', {
            user_id: userId,
            month: month,
            year: year,
            allowances: allowances.filter(a => a.name && a.amount),
            deductions: deductions.filter(d => d.name && d.amount)
        }, {
            onSuccess: () => {
                closeGenerate();
                setIsGenerating(false);
                // Reset form
                setUserId('');
                setAllowances([]);
                setDeductions([]);
            },
            onError: () => {
                setIsGenerating(false);
            }
        });
    };


    if (!isGenerateOpen) {
return null;
}

    return (
        <Dialog open={isGenerateOpen} onOpenChange={closeGenerate}>
            <DialogContent className="sm:max-w-4xl md:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border-border/50 shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Generate Slip Gaji
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        Generate Slip Gaji
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerate} className="flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Pilih Karyawan</Label>
                                    <Select value={userId} onValueChange={setUserId} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="-- Pilih Karyawan --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp: any) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.name} {emp.nip ? `(${emp.nip})` : ''} - {emp.position || 'Staf'}
                                                </SelectItem>
                                            ))}
                                            {employees.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    Tidak ada karyawan.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Bulan</Label>
                                        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                                        {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Tahun</Label>
                                        <Input
                                            type="number"
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            min="2000"
                                            max="2100"
                                        />
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 border space-y-2 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Gaji Pokok (Otomatis)</span>
                                        <span className="font-medium">{formatRupiah(selectedEmployeeSalary)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-semibold text-foreground">Total Diterima</span>
                                        <span className="font-bold text-lg text-primary">{formatRupiah(dynamicNetSalary)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Tunjangan Section */}
                                <div className="space-y-4 bg-emerald-50/30 dark:bg-emerald-950/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50">
                                        <Label className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base tracking-tight">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-xs">+</span>
                                            Tunjangan Tambahan
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAllowances([...allowances, { name: '', amount: '' }])}>
                                            <Plus className="h-3 w-3 mr-1" /> Tambah
                                        </Button>
                                    </div>
                                    {allowances.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center bg-white/50 dark:bg-black/20 rounded-lg border border-dashed border-emerald-200 dark:border-emerald-800/50">
                                            <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 font-medium">Belum ada tunjangan.</p>
                                            <p className="text-xs text-muted-foreground mt-1">Klik "Tambah" untuk memasukkan bonus atau lembur.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {allowances.map((item, index) => (
                                                <div key={index} className="flex flex-col gap-4 relative bg-white dark:bg-background p-4 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 group">
                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-destructive bg-red-50/50 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40 rounded-full opacity-70 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                        setAllowances(allowances.filter((_, i) => i !== index));
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <div className="w-full pr-10">
                                                        <Label className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 uppercase mb-2 block font-bold tracking-wider">Keterangan Tambahan</Label>
                                                        <Input placeholder="Contoh: Lembur 5 Jam, Bonus Target Bulanan..." className="h-10 text-sm bg-muted/30 focus-visible:ring-emerald-500 border-border/50" value={item.name} onChange={(e) => {
                                                            const newArr = [...allowances];
                                                            newArr[index].name = e.target.value;
                                                            setAllowances(newArr);
                                                        }} />
                                                    </div>
                                                    <div className="w-full">
                                                        <Label className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 uppercase mb-2 block font-bold tracking-wider">Nominal (Rp)</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                                                            <Input type="text" placeholder="0" className="h-10 pl-9 text-sm bg-muted/30 focus-visible:ring-emerald-500 border-border/50 font-medium" value={item.amount ? formatRupiah(item.amount).replace('Rp ', '') : ''} onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                                const newArr = [...allowances];
                                                                newArr[index].amount = rawValue;
                                                                setAllowances(newArr);
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Potongan Section */}
                                <div className="space-y-4 bg-red-50/30 dark:bg-red-950/10 p-5 rounded-xl border border-red-100 dark:border-red-900/50 mt-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-red-200/50 dark:border-red-800/50">
                                        <Label className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-base tracking-tight">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs">-</span>
                                            Potongan Gaji
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDeductions([...deductions, { name: '', amount: '' }])}>
                                            <Plus className="h-3 w-3 mr-1" /> Tambah
                                        </Button>
                                    </div>
                                    {deductions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center bg-white/50 dark:bg-black/20 rounded-lg border border-dashed border-red-200 dark:border-red-800/50">
                                            <p className="text-sm text-red-600/70 dark:text-red-400/70 font-medium">Belum ada potongan.</p>
                                            <p className="text-xs text-muted-foreground mt-1">Klik "Tambah" untuk memasukkan kasbon atau denda.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {deductions.map((item, index) => (
                                                <div key={index} className="flex flex-col gap-4 relative bg-white dark:bg-background p-4 rounded-xl border border-red-100 dark:border-red-900 shadow-sm transition-all hover:shadow-md hover:border-red-300 dark:hover:border-red-700 group">
                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-destructive bg-red-50/50 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40 rounded-full opacity-70 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                        setDeductions(deductions.filter((_, i) => i !== index));
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <div className="w-full pr-10">
                                                        <Label className="text-[10px] text-red-600/70 dark:text-red-400/70 uppercase mb-2 block font-bold tracking-wider">Keterangan Potongan</Label>
                                                        <Input placeholder="Contoh: Kasbon Tanggal 15, Terlambat Absen 3 Kali..." className="h-10 text-sm bg-muted/30 focus-visible:ring-red-500 border-border/50" value={item.name} onChange={(e) => {
                                                            const newArr = [...deductions];
                                                            newArr[index].name = e.target.value;
                                                            setDeductions(newArr);
                                                        }} />
                                                    </div>
                                                    <div className="w-full">
                                                        <Label className="text-[10px] text-red-600/70 dark:text-red-400/70 uppercase mb-2 block font-bold tracking-wider">Nominal (Rp)</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                                                            <Input type="text" placeholder="0" className="h-10 pl-9 text-sm bg-muted/30 focus-visible:ring-red-500 border-border/50 font-medium" value={item.amount ? formatRupiah(item.amount).replace('Rp ', '') : ''} onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                                const newArr = [...deductions];
                                                                newArr[index].amount = rawValue;
                                                                setDeductions(newArr);
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                        <Button type="button" variant="outline" onClick={closeGenerate}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isGenerating || !userId}>
                            {isGenerating ? 'Memproses...' : 'Generate Slip Gaji'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

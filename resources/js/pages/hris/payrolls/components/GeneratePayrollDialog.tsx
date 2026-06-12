import { formatDateTime , formatRupiah } from '@/lib/helpers/format';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Calculator, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { usePayrollStore } from '../stores/usePayrollStore';

interface Props {
    employees: any[];
}

export default function GeneratePayrollDialog({ employees }: Props) {
    const { isGenerateOpen, closeGenerate } = usePayrollStore();

    const [userId, setUserId] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [allowances, setAllowances] = useState<{name: string, amount: string}[]>([]);
    const [deductions, setDeductions] = useState<{name: string, amount: string}[]>([]);
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

    
    if (!isGenerateOpen) return null;

    return (
        <Dialog open={isGenerateOpen} onOpenChange={closeGenerate}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
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
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <SelectItem key={i+1} value={String(i+1)}>
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
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                                            Tunjangan (+)
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAllowances([...allowances, { name: '', amount: '' }])}>
                                            <Plus className="h-3 w-3 mr-1" /> Tambah
                                        </Button>
                                    </div>
                                    {allowances.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">Tidak ada tunjangan tambahan.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {allowances.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Nama (cth: Lembur)" className="h-8 text-sm" value={item.name} onChange={(e) => {
                                                        const newArr = [...allowances];
                                                        newArr[index].name = e.target.value;
                                                        setAllowances(newArr);
                                                    }} />
                                                    <Input type="number" placeholder="Nominal" className="h-8 text-sm w-32" value={item.amount} onChange={(e) => {
                                                        const newArr = [...allowances];
                                                        newArr[index].amount = e.target.value;
                                                        setAllowances(newArr);
                                                    }} />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                                                        setAllowances(allowances.filter((_, i) => i !== index));
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Potongan Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-destructive">
                                            Potongan (-)
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDeductions([...deductions, { name: '', amount: '' }])}>
                                            <Plus className="h-3 w-3 mr-1" /> Tambah
                                        </Button>
                                    </div>
                                    {deductions.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">Tidak ada potongan.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {deductions.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Nama (cth: Kasbon, Absen)" className="h-8 text-sm" value={item.name} onChange={(e) => {
                                                        const newArr = [...deductions];
                                                        newArr[index].name = e.target.value;
                                                        setDeductions(newArr);
                                                    }} />
                                                    <Input type="number" placeholder="Nominal" className="h-8 text-sm w-32" value={item.amount} onChange={(e) => {
                                                        const newArr = [...deductions];
                                                        newArr[index].amount = e.target.value;
                                                        setDeductions(newArr);
                                                    }} />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                                                        setDeductions(deductions.filter((_, i) => i !== index));
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

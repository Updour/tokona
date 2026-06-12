import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSalaryStore } from '../stores/useSalaryStore';

export default function SetSalaryDialog() {
    const { isSetSalaryOpen: isOpen, closeSetSalary: onClose, selectedEmployee: employee } = useSalaryStore();
    
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        basic_salary: employee?.employee_salary?.basic_salary || '',
    });

    useEffect(() => {
        if (isOpen && employee) {
            setData('basic_salary', employee?.employee_salary?.basic_salary || '');
            clearErrors();
        }
    }, [isOpen, employee]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/hris/salaries/${employee.id}`, {
            onSuccess: () => {
                toast.success('Gaji pokok berhasil disimpan!');
                onClose();
                reset();
            },
            onError: (err) => {
                toast.error(err.basic_salary || 'Gagal menyimpan pengaturan gaji.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wallet className="h-5 w-5 text-primary" />
                        Pengaturan Gaji
                    </DialogTitle>
                    <DialogDescription>
                        Atur gaji pokok untuk karyawan <span className="font-semibold text-foreground">{employee?.name}</span>. Gaji ini akan menjadi acuan saat melakukan proses Generate Slip Gaji.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="basic_salary" className="font-semibold">
                            Gaji Pokok (Basic Salary) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                            <Input
                                id="basic_salary"
                                type="number"
                                required
                                min="0"
                                className="pl-10 font-mono"
                                placeholder="0"
                                value={data.basic_salary}
                                onChange={(e) => setData('basic_salary', e.target.value)}
                                disabled={processing}
                            />
                        </div>
                        {errors.basic_salary && (
                            <p className="text-sm text-destructive mt-1">{errors.basic_salary}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Format angka tanpa titik atau koma (misal: 5000000 untuk 5 Juta).
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Gaji'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

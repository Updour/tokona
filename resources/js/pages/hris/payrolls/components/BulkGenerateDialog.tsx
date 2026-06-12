import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayrollStore } from '../stores/usePayrollStore';

export default function BulkGenerateDialog() {
    const { isBulkGenerateOpen, closeBulkGenerate } = usePayrollStore();

    const { data, setData, post, processing, reset } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    useEffect(() => {
        if (isBulkGenerateOpen) {
            reset();
        }
    }, [isBulkGenerateOpen]);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hris/payrolls/bulk-generate', {
            onSuccess: () => {
                closeBulkGenerate();
            }
        });
    };

    if (!isBulkGenerateOpen) return null;

    return (
        <Dialog open={isBulkGenerateOpen} onOpenChange={closeBulkGenerate}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Generate Slip Gaji Masal
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Sistem akan membuat slip gaji secara otomatis untuk <strong>seluruh karyawan aktif</strong> di cabang Anda. Komponen tetap dan kalkulasi absensi akan otomatis dimasukkan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleGenerate} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bulan</Label>
                            <Select value={String(data.month)} onValueChange={(v) => setData('month', parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(12)].map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun</Label>
                            <Select value={String(data.year)} onValueChange={(v) => setData('year', parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(5)].map((_, i) => {
                                        const y = new Date().getFullYear() - 2 + i;
                                        return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={closeBulkGenerate} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Memproses Masal...' : 'Mulai Generate'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

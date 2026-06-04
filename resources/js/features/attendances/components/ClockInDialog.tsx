import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, LogIn } from 'lucide-react';

interface ClockInDialogProps {
    isOpen: boolean;
    onClose: () => void;
    form: any;
    onSubmit: () => void;
    branches?: Array<{ id: string; name: string }>;
    isSuperAdmin?: boolean;
}

export function ClockInDialog({ isOpen, onClose, form, onSubmit, branches = [], isSuperAdmin = false }: ClockInDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-700">
                        <LogIn className="h-5 w-5" /> Absensi Masuk (Clock In)
                    </DialogTitle>
                    <DialogDescription>
                        Pastikan Anda berada di area kantor/toko dan telah mengaktifkan GPS/Lokasi pada perangkat Anda.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {isSuperAdmin && (
                        <div className="space-y-1.5">
                            <Label>Pilih Cabang (Khusus Super Admin) <span className="text-red-500">*</span></Label>
                            <Select 
                                value={form.data.branch_id} 
                                onValueChange={(val) => form.setData('branch_id', val)}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih cabang/toko lokasi absen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label>Status Kehadiran <span className="text-red-500">*</span></Label>
                        <Select 
                            value={form.data.type} 
                            onValueChange={(val) => form.setData('type', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">Hadir (Sesuai Jam Kerja)</SelectItem>
                                <SelectItem value="sick">Sakit (Memerlukan Surat Dokter)</SelectItem>
                                <SelectItem value="leave">Cuti / Izin Tertulis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Tulis alasan jika terlambat/sakit/izin..."
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <div className="flex gap-2 p-2.5 rounded-lg bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-100">
                        <Info className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>
                            Browser Anda akan meminta izin lokasi. Harap klik 'Allow' / 'Izinkan' agar koordinat absensi tercatat dengan akurat.
                        </span>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button 
                            type="submit" 
                            disabled={form.processing} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {form.processing ? 'Memproses...' : 'Kirim Absensi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Info, LogOut } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface ClockOutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    form: any;
    onSubmit: () => void;
}

export function ClockOutDialog({ isOpen, onClose, form, onSubmit }: ClockOutDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-700">
                        <LogOut className="h-5 w-5" /> Absensi Pulang (Clock Out)
                    </DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin melakukan absensi pulang sekarang?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="flex gap-2 p-2.5 rounded-lg bg-amber-50 text-[10px] text-amber-800 border border-amber-100">
                        <Info className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>
                            Aplikasi akan memverifikasi koordinat GPS Anda untuk memastikan kepulangan dari area kerja.
                        </span>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button 
                            type="submit" 
                            disabled={form.processing} 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {form.processing ? 'Memproses...' : 'Ya, Absen Pulang'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

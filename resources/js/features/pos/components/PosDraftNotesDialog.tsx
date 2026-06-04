import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PosDraftNotesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draftNotes: string;
    setDraftNotes: (notes: string) => void;
    handleSaveDraft: () => void;
}

export function PosDraftNotesDialog({
    open,
    onOpenChange,
    draftNotes,
    setDraftNotes,
    handleSaveDraft
}: PosDraftNotesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black text-slate-800">Tahan Transaksi (Simpan Draft)</DialogTitle>
                    <DialogDescription className="text-xs">
                        Simpan keranjang saat ini sebagai antrean sementara untuk melayani pelanggan berikutnya terlebih dahulu.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3">
                    <Label className="text-xs font-bold text-slate-555">Catatan Draft / Nama Antrean</Label>
                    <Input
                        placeholder="Contoh: Meja 5, Antrean Ibu Budi, Pending Mie..."
                        className="h-10 text-xs border-slate-200"
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="text-xs font-bold"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSaveDraft}
                        className="text-xs font-black bg-slate-900 hover:bg-slate-950 text-white"
                    >
                        Simpan Antrean
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

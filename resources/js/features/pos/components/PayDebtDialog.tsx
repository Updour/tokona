import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/helpers/format';
import { toast } from 'sonner';
import { Banknote, CreditCard, Receipt } from 'lucide-react';

interface PayDebtDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export function PayDebtDialog({ isOpen, onClose, transaction }: PayDebtDialogProps) {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!transaction) return null;

    const remainingDebt = transaction.total - (transaction.paid_amount || 0);

    const handleAutoFill = () => {
        setAmount(remainingDebt.toString());
    };

    const handleSubmit = () => {
        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) {
            toast.error('Masukkan nominal pelunasan yang valid');
            return;
        }

        if (numAmount > remainingDebt) {
            toast.error('Nominal pelunasan tidak boleh lebih besar dari sisa piutang');
            return;
        }

        setIsSubmitting(true);
        router.post(`/pos/${transaction.id}/pay-debt`, {
            amount: numAmount,
            payment_method: paymentMethod,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pelunasan piutang berhasil dicatat!');
                setAmount('');
                onClose();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string || 'Gagal mencatat pelunasan');
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        Terima Pelunasan Piutang
                    </DialogTitle>
                    <DialogDescription>
                        Faktur: <span className="font-bold text-slate-900">{transaction.invoice_number}</span>
                        <br />
                        Pelanggan: <span className="font-bold">{transaction.customer?.name || 'Umum'}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-700 font-medium">Sisa Piutang:</span>
                            <span className="text-amber-900 font-bold text-lg">{formatRupiah(remainingDebt)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Nominal Pembayaran</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-slate-500 font-bold">Rp</div>
                            <Input
                                type="number"
                                className="pl-9 h-11 text-lg font-bold"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="absolute right-1 top-1.5 h-8 text-xs font-bold text-indigo-600"
                                onClick={handleAutoFill}
                            >
                                Lunas Semua
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Masuk via Metode Pembayaran</Label>
                        <Select value={paymentMethod} onValueChange={(val: 'cash' | 'transfer') => setPaymentMethod(val)}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Pilih Metode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="h-4 w-4 text-emerald-500" />
                                        <span>Tunai (Cash)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="transfer">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-blue-500" />
                                        <span>Transfer Bank / QRIS</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !amount || Number(amount) <= 0} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSubmitting ? 'Memproses...' : 'Simpan Pelunasan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

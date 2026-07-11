import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/helpers/format';

interface Props {
    purchase: any;
    remainingBalance: number;
}

export function PurchasePaymentDialog({ purchase, remainingBalance }: Props) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        amount: remainingBalance.toString(),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        notes: '',
    });

    // Bersihkan format "Rp " dan pemisah ribuan sebelum dikirim ke backend
    transform((data) => ({
        ...data,
        amount: data.amount.replace(/[^0-9]/g, ''),
    }));

    // Perbarui amount jika remainingBalance berubah dan modal dibuka
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setData('amount', remainingBalance.toString());
        } else {
            reset();
        }
        setOpen(newOpen);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/purchases/${purchase.id}/payments`, {
            onSuccess: () => {
                toast.success('Pembayaran berhasil dicatat!');
                setOpen(false);
                reset();
            },
            onError: (err) => {
                toast.error(err.amount || 'Gagal memproses pembayaran. Periksa kembali input Anda.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="shadow-sm">
                    <Wallet className="mr-2 h-4 w-4" /> Bayar Tagihan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Catat Pembayaran PO</DialogTitle>
                        <DialogDescription>
                            Masukkan nominal pembayaran cicilan atau pelunasan untuk PO #{purchase.invoice_number || 'Draft'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="amount">Nominal Bayar (Rp)</Label>
                            <Input
                                id="amount"
                                type="text"
                                min="1"
                                max={formatRupiah(remainingBalance)}
                                value={formatRupiah(data.amount.replace(/[^0-9]/g, ''))}
                                onChange={(e) => setData('amount', formatRupiah(e.target.value.replace(/[^0-9]/g, '')))}
                                placeholder="Cth: 500000"
                            />
                            {errors.amount && <span className="text-sm text-destructive">{errors.amount}</span>}
                            <span className="text-xs text-muted-foreground mt-1">Sisa tagihan maksimal: Rp {remainingBalance.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="payment_date">Tanggal Bayar</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                            />
                            {errors.payment_date && <span className="text-sm text-destructive">{errors.payment_date}</span>}
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="payment_method">Metode Pembayaran</Label>
                            <Select value={data.payment_method} onValueChange={(val) => setData('payment_method', val)}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Pilih metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash / Tunai</SelectItem>
                                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                                    <SelectItem value="Giro/Cek">Giro / Cek</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_method && <span className="text-sm text-destructive">{errors.payment_method}</span>}
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Cth: Pembayaran termin 1 via BCA"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            {errors.notes && <span className="text-sm text-destructive">{errors.notes}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || Number(data.amount) <= 0 || Number(data.amount) > remainingBalance}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Proses Pembayaran
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

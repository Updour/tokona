import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle2, Building2 } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';
import { usePage } from '@inertiajs/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payment: any;
    purchase: any;
}

export function PurchasePaymentReceiptDialog({ isOpen, onClose, payment, purchase }: Props) {
    const { props } = usePage<any>();
    const appName = props?.appName || 'Tokona ERP';

    if (!payment || !purchase) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md print:max-w-none print:w-[80mm] print:p-0 print:border-none print:shadow-none bg-slate-50">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Bukti Pelunasan</DialogTitle>
                    <DialogDescription>Pratinjau struk bukti pelunasan hutang (termin).</DialogDescription>
                </DialogHeader>

                {/* Printable Area - styled like a thermal receipt or standard proof of payment */}
                <div id="payment-receipt-print-area" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-4 mx-auto w-full max-w-sm print:max-w-none relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <CheckCircle2 className="h-32 w-32" />
                    </div>

                    <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-6 relative z-10">
                        <div className="flex justify-center mb-2">
                            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">TANDA TERIMA</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">Pembayaran Hutang Pemasok</p>
                    </div>

                    <div className="space-y-4 text-sm relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 font-semibold">Tgl Pembayaran:</span>
                            <span className="font-bold text-slate-800 text-right">
                                {new Date(payment.payment_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 font-semibold">No. Invoice PO:</span>
                            <span className="font-bold text-slate-800 text-right">{purchase.invoice_number}</span>
                        </div>

                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 font-semibold">Metode:</span>
                            <span className="font-bold text-slate-800 text-right uppercase">{payment.payment_method}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 mb-2">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Dibayarkan Kepada
                            </div>
                            <div className="font-bold text-slate-800 text-base">{purchase.supplier?.name || '-'}</div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-4 mt-4">
                            <div className="flex flex-col items-center justify-center bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                <span className="text-xs uppercase font-bold text-emerald-600 tracking-widest mb-1">Nominal Pembayaran</span>
                                <span className="text-2xl font-black text-emerald-700 tracking-tight">{formatRupiah(payment.amount)}</span>
                            </div>
                        </div>

                        {payment.notes && (
                            <div className="text-center mt-4">
                                <span className="text-xs text-slate-500 italic block">"{payment.notes}"</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200 text-center relative z-10">
                        <p className="text-[10px] text-slate-400 font-medium">Dicetak dari {appName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Oleh: {payment.creator?.name || 'Sistem'}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">{new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 print:hidden">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90">
                        <Printer className="mr-2 h-4 w-4" /> Cetak Bukti
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

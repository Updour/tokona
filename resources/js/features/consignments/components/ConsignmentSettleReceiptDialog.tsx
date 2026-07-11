import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle2, Building2 } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';
import { usePage } from '@inertiajs/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    consignment: any;
}

export function ConsignmentSettleReceiptDialog({ isOpen, onClose, consignment }: Props) {
    const { props } = usePage<any>();
    const appName = props?.appName || 'Tokona ERP';

    if (!consignment) return null;

    const handlePrint = () => {
        const originalTitle = document.title;
        const refStr = consignment.reference_number || consignment.id.substring(0,8).toUpperCase();
        document.title = `Bukti_Setoran_Titipan_${refStr}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md print:max-w-none print:w-[80mm] print:p-0 print:border-none print:shadow-none bg-slate-50">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Bukti Setoran Titipan</DialogTitle>
                    <DialogDescription>Pratinjau struk bukti penyetoran/pembayaran barang titipan. (Pilih "Save as PDF" saat mencetak jika tidak ada printer thermal).</DialogDescription>
                </DialogHeader>

                {/* Printable Area - styled like a thermal receipt */}
                <div id="consignment-settle-receipt-print-area" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-4 mx-auto w-full max-w-sm print:max-w-none relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <CheckCircle2 className="h-32 w-32" />
                    </div>

                    <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-6 relative z-10">
                        <h3 className="font-bold text-slate-800 text-lg uppercase mb-1">{consignment.tenant?.name || appName}</h3>
                        <p className="text-xs text-slate-500 mb-4">{consignment.branch?.name || 'Pusat'}</p>
                        
                        <div className="flex justify-center mb-2">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">TANDA TERIMA SETORAN</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">Sesi: {consignment.reference_number || consignment.id.substring(0,8).toUpperCase()}</p>
                    </div>

                    <div className="space-y-4 text-sm relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 font-semibold">Tgl Disetor:</span>
                            <span className="font-bold text-slate-800 text-right">
                                {consignment.settled_at ? new Date(consignment.settled_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 mb-2">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Dibayarkan Kepada
                            </div>
                            <div className="font-bold text-slate-800 text-base">{consignment.supplier?.name || '-'}</div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-4 mt-4 space-y-2">
                            {consignment.items?.map((item: any) => {
                                const sold = item.qty_sold || 0;
                                if (sold === 0) return null;
                                return (
                                    <div key={item.id} className="flex justify-between text-xs">
                                        <div className="truncate max-w-[150px]">
                                            <span className="font-semibold text-slate-700">{item.product?.name}</span>
                                            <div className="text-slate-400">{sold} x {formatRupiah(item.base_cost)}</div>
                                        </div>
                                        <div className="font-bold text-slate-800">{formatRupiah(sold * item.base_cost)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-500">
                                <span>Potongan/Diskon:</span>
                                <span>{formatRupiah(consignment.total_discount || 0)}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-4 border border-blue-100 mt-2">
                                <span className="text-xs uppercase font-bold text-blue-600 tracking-widest mb-1">Total Bersih Disetor</span>
                                <span className="text-2xl font-black text-blue-700 tracking-tight">{formatRupiah(consignment.total_paid || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200 text-center relative z-10">
                        <p className="text-[10px] text-slate-400 font-medium">Dicetak dari {consignment.tenant?.name || appName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">{new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 print:hidden">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="mr-2 h-4 w-4" /> Cetak Bukti Setor
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

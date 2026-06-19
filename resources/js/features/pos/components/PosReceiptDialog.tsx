import { CheckCircle2, Printer, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah , formatDateTime, formatNumber } from '@/lib/helpers/format';
import { usePage } from '@inertiajs/react';

interface PosReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lastTransaction: any;
    handlePrintReceipt: () => void;
    handleDownloadReceiptImage: () => void;
    handleSendWhatsAppReceipt: () => void;
}

export function PosReceiptDialog({
    open,
    onOpenChange,
    lastTransaction,
    handlePrintReceipt,
    handleDownloadReceiptImage,
    handleSendWhatsAppReceipt
}: PosReceiptDialogProps) {
    const { auth, tenants, branches } = usePage<any>().props;
    
    const currentTenant = tenants?.find((t: any) => t.id === auth?.user?.tenant_id);
    const currentBranch = branches?.find((b: any) => b.id === auth?.user?.branch_id);
    
    const storeName = currentTenant?.name || 'TOKONA ERP & CRM';
    const branchName = currentBranch?.name || 'Cabang Kasir Utama Tokona';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader className="flex flex-col items-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce mb-2" />
                    <DialogTitle className="text-lg font-black text-slate-800">Transaksi Sukses!</DialogTitle>
                    <DialogDescription className="text-xs text-center">
                        Faktur penjualan telah tersimpan dan terintegrasi secara otomatis di modul Akuntansi.
                    </DialogDescription>
                </DialogHeader>

                {/* DETAIL STRUK (Siap Cetak / Thermal 58-80mm Layout) */}
                <div id="receipt-print-area" className="my-4 border border-dashed rounded-lg bg-slate-50 max-h-[360px] overflow-y-auto mx-auto max-w-sm w-full">
                    <div id="receipt-capture-area" className="p-4 bg-slate-50 font-mono text-xs text-slate-800 space-y-4">
                    <div className="text-center space-y-1">
                        <h2 className="text-sm font-black tracking-widest uppercase">{storeName}</h2>
                        <p className="text-[10px] text-slate-500">{branchName}</p>
                        <p className="text-[10px] text-slate-500">Tanggal: {lastTransaction?.date ? formatDateTime(lastTransaction.date) : '-'}</p>
                        <p className="text-[10px] text-slate-500">Inv: {lastTransaction?.invoice_number}</p>
                        <p className="text-[10px] text-slate-500">Pelanggan: {lastTransaction?.customer}</p>
                        <p className="text-[10px] text-slate-500">Kasir: {lastTransaction?.cashier || lastTransaction?.creator?.name || '-'}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-2">
                        {lastTransaction?.items?.map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-bold">{it.name}</p>
                                    <p className="text-[10px] text-slate-500">{it.qty} x {formatRupiah(it.price)}</p>
                                </div>
                                <span className="font-bold shrink-0">{formatRupiah(it.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatRupiah(lastTransaction?.subtotal || 0)}</span>
                        </div>
                        {lastTransaction?.discount > 0 && (
                            <div className="flex justify-between text-red-600 font-bold">
                                <span>Diskon</span>
                                <span>- {formatRupiah(lastTransaction?.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>PPN ({lastTransaction?.subtotal && lastTransaction?.tax > 0 ? `${Math.round((lastTransaction.tax / Math.max(1, (lastTransaction.subtotal - (lastTransaction.discount || 0)))) * 100)}%` : '0%'})</span>
                            <span>{formatRupiah(lastTransaction?.tax || 0)}</span>
                        </div>
                        {lastTransaction?.rounding_diff !== 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Pembulatan Tunai</span>
                                <span>{lastTransaction?.rounding_diff > 0 ? '+' : ''}{formatRupiah(lastTransaction?.rounding_diff || 0)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-slate-300">
                            <span>TOTAL BELANJA</span>
                            <span>{formatRupiah(lastTransaction?.total || 0)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between">
                            <span>Metode Bayar</span>
                            <span className="uppercase font-bold">{lastTransaction?.payment_method === 'cash' ? 'Tunai' : lastTransaction?.payment_method === 'transfer' ? 'Transfer' : 'Hutang'}</span>
                        </div>
                        {lastTransaction?.payment_method !== 'debt' && (
                            <>
                                <div className="flex justify-between">
                                    <span>Dibayar</span>
                                    <span>{formatRupiah(lastTransaction?.paid_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kembalian</span>
                                    <span>{formatRupiah(lastTransaction?.change_amount || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {(lastTransaction?.earned_points > 0 || lastTransaction?.current_points > 0) && (
                        <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                            {lastTransaction?.earned_points > 0 && (
                                <div className="flex justify-between font-bold text-amber-600">
                                    <span>Poin Tambahan (Hari Ini)</span>
                                    <span>+ {formatNumber(lastTransaction.earned_points)} Pts</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black">
                                <span>Total Poin Tersedia</span>
                                <span>{formatNumber(lastTransaction?.current_points || 0)} Pts</span>
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400">
                        *** TERIMA KASIH ATAS KUNJUNGAN ANDA ***
                    </div>
                </div>
            </div>

                <DialogFooter className="flex flex-row justify-between items-center mt-2 pt-2 border-t border-slate-100">
                    <TooltipProvider>
                        <div className="flex gap-1.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handlePrintReceipt}
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 bg-white shadow-sm"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Cetak / Simpan PDF</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handleDownloadReceiptImage}
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Unduh Gambar</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handleSendWhatsAppReceipt}
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-white shadow-sm"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Kirim WhatsApp</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>

                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-9 px-5 bg-slate-900 hover:bg-slate-950 text-white rounded-full text-xs font-bold shadow-sm"
                    >
                        Selesai
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

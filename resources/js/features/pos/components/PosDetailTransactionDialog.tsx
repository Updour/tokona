import { Receipt, Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface PosDetailTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDetailTransaction: any;
    branches: any[];
    isSuperAdmin: boolean;
    handleReprint: (tx: any) => void;
}

export function PosDetailTransactionDialog({
    open,
    onOpenChange,
    selectedDetailTransaction,
    branches,
    isSuperAdmin,
    handleReprint
}: PosDetailTransactionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="flex flex-row justify-between items-start gap-4 border-b pb-4 shrink-0">
                    <div>
                        <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-indigo-650" /> Detail Faktur: {selectedDetailTransaction?.invoice_number}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Informasi lengkap transaksi penjualan kasir cabang
                        </DialogDescription>
                    </div>
                    {selectedDetailTransaction && (
                        <Badge
                            className={`border-0 font-extrabold text-[10px] px-2.5 py-1 ${
                                selectedDetailTransaction.status === 'paid'
                                    ? 'bg-emerald-500 text-white'
                                    : selectedDetailTransaction.status === 'returned'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-white'
                            }`}
                        >
                            {selectedDetailTransaction.status === 'paid'
                                ? 'Lunas / Terbayar'
                                : selectedDetailTransaction.status === 'returned'
                                ? 'Diretur'
                                : 'Kredit'}
                        </Badge>
                    )}
                </DialogHeader>

                {selectedDetailTransaction && (
                    <div className="flex-1 overflow-y-auto space-y-5 py-4 min-h-0 pr-1 text-slate-800">
                        {/* Grid Metadata Transaksi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">WAKTU & KASIR</span>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-slate-800">Tanggal: {new Date(selectedDetailTransaction.created_at).toLocaleString('id-ID')}</p>
                                    <p className="text-slate-650 font-semibold">Kasir: {selectedDetailTransaction.creator?.name || 'Kasir Default'}</p>
                                    <p className="text-slate-500 text-[10px]">ID Kasir: {selectedDetailTransaction.creator?.id?.slice(0, 8) || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PELANGGAN</span>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-slate-800">{selectedDetailTransaction.customer?.name || 'Pelanggan Umum (Walk-in)'}</p>
                                    {selectedDetailTransaction.customer?.phone && (
                                        <p className="text-slate-650">No. HP: {selectedDetailTransaction.customer.phone}</p>
                                    )}
                                    {selectedDetailTransaction.customer?.email && (
                                        <p className="text-slate-500 text-[10px]">Email: {selectedDetailTransaction.customer.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PEMBAYARAN & OUTLET</span>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-slate-850">Metode: <span className="uppercase text-indigo-650 font-black">{selectedDetailTransaction.payment_method === 'cash' ? 'Tunai (Cash)' : selectedDetailTransaction.payment_method === 'transfer' ? 'Transfer' : 'Piutang'}</span></p>
                                    <p className="text-slate-655 font-semibold">Outlet: {branches?.find((b: any) => b.id === selectedDetailTransaction.branch_id)?.name || 'Cabang POS'}</p>
                                    <p className="text-slate-500 text-[10px]">Kode Cabang: {branches?.find((b: any) => b.id === selectedDetailTransaction.branch_id)?.code || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Daftar Barang Belanja */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rincian Keranjang Barang</span>
                            <div className="border rounded-lg overflow-hidden border-slate-200 bg-white">
                                <Table>
                                    <TableHeader className="bg-slate-50 font-black">
                                        <TableRow>
                                            <TableHead className="h-9 font-black">Barang / Item</TableHead>
                                            {isSuperAdmin && <TableHead className="text-right h-9 font-black text-slate-705">Harga Modal</TableHead>}
                                            <TableHead className="text-right h-9 font-black">Harga Jual</TableHead>
                                            <TableHead className="text-center h-9 font-black">Qty</TableHead>
                                            <TableHead className="text-right h-9 font-black">Subtotal</TableHead>
                                            {isSuperAdmin && <TableHead className="text-right h-9 font-black text-emerald-850">Margin</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {selectedDetailTransaction.items?.map((it: any, idx: number) => {
                                            const cost = parseFloat(it.product?.base_cost || 0);
                                            const price = parseFloat(it.price || 0);
                                            const qty = parseInt(it.qty || 0);
                                            const itemSubtotal = parseFloat(it.subtotal || 0);
                                            const profit = (price - cost) * qty;

                                            return (
                                                <TableRow key={idx} className="hover:bg-slate-50/30">
                                                    <TableCell className="py-2.5">
                                                        <div className="font-bold text-slate-850">{it.product?.name || 'Produk Terhapus'}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                            {it.product?.sku ? `SKU: ${it.product.sku}` : ''}
                                                            {it.product?.barcode ? ` | Barcode: ${it.product.barcode}` : ''}
                                                        </div>
                                                    </TableCell>
                                                    {isSuperAdmin && (
                                                        <TableCell className="text-right font-mono text-slate-550 py-2.5">
                                                            {formatRupiah(cost)}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right font-mono font-bold text-slate-800 py-2.5">
                                                        {formatRupiah(price)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-700 py-2.5">
                                                        {qty}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-black text-slate-900 py-2.5">
                                                        {formatRupiah(itemSubtotal)}
                                                    </TableCell>
                                                    {isSuperAdmin && (
                                                        <TableCell className={`text-right font-mono font-black py-2.5 ${profit >= 0 ? 'text-emerald-600' : 'text-red-655'}`}>
                                                            {formatRupiah(profit)}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Rincian Finansial Faktur */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Profit Margin Box (Khusus Super Admin) */}
                            <div>
                                {isSuperAdmin && (
                                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
                                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block font-bold">AUDIT PROFIT MARGIN (SUPER ADMIN VIEW)</span>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-650 font-bold">Total Keuntungan Bersih:</span>
                                            <span className="font-mono font-black text-base text-emerald-700">
                                                {formatRupiah(
                                                    selectedDetailTransaction.items?.reduce((acc: number, it: any) => {
                                                        const cost = parseFloat(it.product?.base_cost || 0);
                                                        const price = parseFloat(it.price || 0);
                                                        const qty = parseInt(it.qty || 0);

                                                        return acc + ((price - cost) * qty);
                                                    }, 0) || 0
                                                )}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-emerald-650 leading-relaxed font-medium">
                                            * Keuntungan dihitung dari selisih harga jual faktur dikurangi harga modal supplier (base cost) produk dikalikan kuantitas.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-lg space-y-1.5">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1 font-bold">RINGKASAN TOTAL</span>
                                <div className="flex justify-between text-slate-650">
                                    <span>Subtotal Belanja</span>
                                    <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.subtotal || 0))}</span>
                                </div>
                                {parseFloat(selectedDetailTransaction.discount || 0) > 0 && (
                                    <div className="flex justify-between text-red-650 font-bold">
                                        <span>Diskon Promo / Voucher</span>
                                        <span className="font-mono">- {formatRupiah(parseFloat(selectedDetailTransaction.discount || 0))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-650">
                                    <span>Pajak (PPN)</span>
                                    <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.tax || 0))}</span>
                                </div>
                                {parseFloat(selectedDetailTransaction.rounding_diff || 0) !== 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Selisih Pembulatan Tunai</span>
                                        <span className="font-mono">{parseFloat(selectedDetailTransaction.rounding_diff || 0) > 0 ? '+' : ''}{formatRupiah(parseFloat(selectedDetailTransaction.rounding_diff || 0))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-black text-sm text-indigo-950 border-t border-dashed border-indigo-200/60 pt-1.5">
                                    <span>TOTAL TRANSAKSI</span>
                                    <span className="font-mono text-indigo-650">{formatRupiah(parseFloat(selectedDetailTransaction.total || 0))}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Uang Dibayar</span>
                                        <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.paid_amount || 0))}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-800">
                                        <span>Uang Kembalian</span>
                                        <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.change_amount || 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="shrink-0 pt-3 border-t border-slate-100 flex flex-row gap-2">
                    <Button
                        onClick={() => {
                            if (selectedDetailTransaction) {
                                window.open(`/export/invoice/${selectedDetailTransaction.id}`, '_blank');
                            }
                        }}
                        variant="outline"
                        className="font-bold gap-1.5 h-10 border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
                    >
                        <Download className="h-4 w-4 text-slate-500" /> Unduh PDF
                    </Button>
                    <Button
                        onClick={() => {
                            handleReprint(selectedDetailTransaction);
                        }}
                        variant="outline"
                        className="font-bold gap-1.5 h-10 border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
                    >
                        <Printer className="h-4 w-4 text-slate-500" /> Cetak Struk
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 font-black h-10 bg-slate-900 hover:bg-slate-950 text-white"
                    >
                        Tutup Detail
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

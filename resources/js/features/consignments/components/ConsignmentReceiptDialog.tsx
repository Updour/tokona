import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, PackageOpen, Building2 } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    consignment: any;
}

export function ConsignmentReceiptDialog({ isOpen, onClose, consignment }: Props) {
    const { props } = usePage<any>();
    const appName = props?.appName || 'Tokona ERP';

    if (!consignment) return null;

    const totalEstValue = consignment.items?.reduce((acc: number, curr: any) => acc + (curr.subtotal || 0), 0) || 0;

    const handlePrint = () => {
        const originalTitle = document.title;
        const refStr = consignment.reference_number || consignment.id.substring(0,8).toUpperCase();
        document.title = `Tanda_Terima_Titipan_${refStr}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none bg-slate-50">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Bukti Tanda Terima Konsinyasi</DialogTitle>
                    <DialogDescription>Pratinjau struk/faktur penerimaan barang titipan dari supplier. (Anda bisa memilih "Save as PDF" pada dialog cetak jika tidak memiliki printer).</DialogDescription>
                </DialogHeader>

                {/* Printable Area - styled like a standard paper invoice */}
                <div id="consignment-receipt-print-area" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none mx-auto w-full max-w-2xl print:max-w-none relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <PackageOpen className="h-6 w-6 text-primary" />
                                TANDA TERIMA TITIPAN
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Sesi: {consignment.reference_number || consignment.id.substring(0,8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-slate-800 text-lg uppercase">{consignment.tenant?.name || appName}</h3>
                            <h4 className="font-semibold text-slate-600 text-sm mt-1">{consignment.branch?.name || 'Pusat'}</h4>
                            <p className="text-xs text-slate-500 max-w-[200px] ml-auto mt-1">{consignment.branch?.address || ''}</p>
                            <p className="text-xs text-slate-500">{consignment.branch?.phone || ''}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Diterima Dari Supplier
                            </div>
                            <div className="font-bold text-slate-800 text-base">{consignment.supplier?.name || '-'}</div>
                            <div className="text-slate-600 mt-1">{consignment.supplier?.address || '-'}</div>
                            <div className="text-slate-600">{consignment.supplier?.phone || '-'}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Tgl Terima:</span>
                                <span className="font-bold text-slate-800 text-right">
                                    {new Date(consignment.consignment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Jatuh Tempo:</span>
                                <span className="font-bold text-rose-600 text-right">
                                    {consignment.due_date ? new Date(consignment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Status:</span>
                                <span className="font-bold text-slate-800 text-right uppercase">
                                    {consignment.status === 'active' ? 'Aktif (Berjalan)' : 'Selesai'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700">Nama Produk / Item</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-center w-[100px]">Qty Terima</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right w-[150px]">Harga Dasar</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right w-[150px]">Subtotal (Est)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consignment.items?.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-transparent">
                                        <TableCell>
                                            <div className="font-semibold text-slate-800">{item.product?.name || '-'}</div>
                                            {item.product?.sku && <div className="text-xs text-slate-500 font-mono">SKU: {item.product.sku}</div>}
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-slate-700">{item.qty_received}</TableCell>
                                        <TableCell className="text-right text-slate-600">{formatRupiah(item.base_cost)}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-800">{formatRupiah(item.subtotal)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="w-1/2">
                            {consignment.notes && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Catatan:</span>
                                    <p className="text-sm text-slate-700 mt-1 italic">{consignment.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="w-1/3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-base">
                                <span className="font-bold text-slate-600">Total Estimasi:</span>
                                <span className="font-black text-slate-900 tracking-tight">{formatRupiah(totalEstValue)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-sm">
                        <div className="text-center w-40">
                            <p className="text-slate-500 mb-12">Pihak Supplier,</p>
                            <div className="border-b border-slate-400"></div>
                            <p className="text-xs font-semibold text-slate-700 mt-1">{consignment.supplier?.name || 'Tanda Tangan'}</p>
                        </div>
                        <div className="text-center text-xs text-slate-400">
                            <p>Dokumen Tanda Terima Barang Titipan</p>
                            <p>Dicetak pada {new Date().toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-center w-40">
                            <p className="text-slate-500 mb-12">Penerima,</p>
                            <div className="border-b border-slate-400"></div>
                            <p className="text-xs font-semibold text-slate-700 mt-1">{consignment.branch?.name || 'Tanda Tangan'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 print:hidden">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="mr-2 h-4 w-4" /> Cetak Tanda Terima
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

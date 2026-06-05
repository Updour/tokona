import { PackageOpen, Download } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatDateTime, formatRupiah } from '@/lib/helpers/format';
import { useConsignmentStore } from '../stores/useConsignmentStore';

export function ConsignmentDetailDialog() {
    const { isDetailFormOpen, closeDetailForm, selectedConsignmentDetail: consignment } = useConsignmentStore();

    if (!consignment) {
return null;
}

    return (
        <Dialog open={isDetailFormOpen} onOpenChange={closeDetailForm}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PackageOpen className="h-5 w-5 text-primary" />
                        Detail Barang Titipan
                    </DialogTitle>
                    <DialogDescription>
                        Informasi lengkap rincian barang dari supplier.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
                        <div>
                            <p className="text-xs text-muted-foreground">Supplier</p>
                            <p className="text-sm font-bold">{consignment.supplier?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Cabang</p>
                            <p className="text-sm font-semibold">{consignment.branch?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tanggal Terima</p>
                            <p className="text-sm font-semibold">{formatDateTime(consignment.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm font-bold text-primary">
                                {consignment.status === 'settled' ? 'Selesai (Sudah Setor)' : 'Berjalan (Belum Setor)'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-2">Rincian Barang</h4>
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-slate-600">Produk</th>
                                        <th className="px-3 py-2 text-right font-medium text-slate-600">Diterima</th>
                                        <th className="px-3 py-2 text-right font-medium text-slate-600">Laku</th>
                                        <th className="px-3 py-2 text-right font-medium text-slate-600">Sisa/Retur</th>
                                        <th className="px-3 py-2 text-right font-medium text-slate-600">Harga Satuan</th>
                                        <th className="px-3 py-2 text-right font-medium text-slate-600">Total Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consignment.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-t">
                                            <td className="px-3 py-2">{item.product?.name || 'Produk Tidak Diketahui'}</td>
                                            <td className="px-3 py-2 text-right">{item.qty_received}</td>
                                            <td className="px-3 py-2 text-right font-medium text-green-600">
                                                {consignment.status === 'settled' ? item.qty_sold : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-yellow-600">
                                                {consignment.status === 'settled' ? item.qty_returned : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right">{formatRupiah(item.price_per_item)}</td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {consignment.status === 'settled' 
                                                    ? formatRupiah(item.qty_sold * item.price_per_item)
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!consignment.items || consignment.items.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">Tidak ada item</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {consignment.status === 'settled' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center mt-2">
                            <div>
                                <p className="text-sm text-green-800 font-semibold">Total Pembayaran ke Supplier</p>
                                <p className="text-xs text-green-600 mt-1">Sesuai dengan jumlah barang laku (termasuk diskon jika ada)</p>
                            </div>
                            <div className="text-xl font-black text-green-700">
                                {formatRupiah(consignment.total_paid || 0)}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => window.open(`/consignments/${consignment.id}/pdf`, '_blank')}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" /> Download Tanda Terima (PDF)
                    </Button>
                    <Button type="button" onClick={closeDetailForm}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

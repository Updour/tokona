import { formatRupiah , formatDateTime} from '@/lib/helpers/format';
import { Store, MapPin, ClipboardCheck, Eye, FileText, Calendar, User, Navigation, FileSpreadsheet } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VisitDetailsDialogProps {
    visit: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VisitDetailsDialog({ visit, open, onOpenChange }: VisitDetailsDialogProps) {
    if (!visit) {
return null;
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black text-indigo-650 flex items-center gap-1.5">
                        <Store className="h-5 w-5" /> Detail Lembar Kunjungan Lapangan
                    </DialogTitle>
                    <DialogDescription>
                        Laporan audit kunjungan GPS lengkap oleh sales representative di toko mitra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 my-2">
                    {/* Grid Detail */}
                    <div className="grid grid-cols-2 gap-4 border rounded-xl p-4 bg-slate-50/50 text-xs">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                <User className="h-3.5 w-3.5 text-slate-400" /> Sales Representative
                            </div>
                            <p className="font-black text-slate-800 text-sm ml-5">{visit.sales_person?.name ?? '-'}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Waktu Kunjungan
                            </div>
                            <p className="font-black text-slate-800 text-sm ml-5">
                                {visit.visited_at ? formatDateTime(visit.visited_at) : '-'}
                            </p>
                        </div>
                        <div className="space-y-2 col-span-2 border-t pt-2 mt-1">
                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                <Navigation className="h-3.5 w-3.5 text-slate-400" /> Koordinat GPS Check-in
                            </div>
                            <p className="font-bold text-slate-700 ml-5">
                                Latitude: <span className="font-black text-indigo-600">{visit.latitude ?? '-'}</span>, 
                                Longitude: <span className="font-black text-indigo-600">{visit.longitude ?? '-'}</span>
                            </p>
                            <p className="text-[10px] text-slate-450 ml-5 font-bold flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-emerald-500" /> Lokasi: {visit.address_text ?? 'Tidak terekam'}
                            </p>
                        </div>
                    </div>

                    {/* Catatan Lapangan */}
                    <div className="space-y-1.5">
                        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Catatan Lapangan Sales</h4>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                            "{visit.notes ?? 'Tidak ada catatan tambahan.'}"
                        </div>
                    </div>

                    {/* Jika kunjungan menghasilkan order (ordered) */}
                    {visit.status === 'ordered' && visit.sales_order && (
                        <div className="space-y-2 border-t pt-3">
                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                Faktur Pesanan Lapangan (Canvas Order)
                            </h4>
                            
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-[11px] font-bold py-1.5">Nama Produk</TableHead>
                                            <TableHead className="text-[11px] font-bold text-center py-1.5">Qty</TableHead>
                                            <TableHead className="text-[11px] font-bold text-right py-1.5">Harga</TableHead>
                                            <TableHead className="text-[11px] font-bold text-right py-1.5">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visit.sales_order.items?.map((it: any) => (
                                            <TableRow key={it.id} className="text-xs">
                                                <TableCell className="font-bold py-1.5">{it.product?.name ?? 'Produk'}</TableCell>
                                                <TableCell className="text-center py-1.5 font-bold">{it.qty}</TableCell>
                                                <TableCell className="text-right py-1.5">{formatRupiah(parseFloat(it.price))}</TableCell>
                                                <TableCell className="text-right py-1.5 font-bold text-slate-800">{formatRupiah(parseFloat(it.subtotal))}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50 font-black text-xs border-t">
                                            <TableCell colSpan={3} className="text-right py-2">Total Belanja</TableCell>
                                            <TableCell className="text-right py-2 text-indigo-650">
                                                {formatRupiah(parseFloat(visit.sales_order.total_amount))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1 mt-1">
                                <span>Metode Pembayaran: <span className="uppercase text-emerald-600 font-black">{visit.sales_order.payment_method}</span></span>
                                <span>Status Pembayaran: <span className="uppercase text-indigo-600 font-black">{visit.sales_order.payment_status}</span></span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs">
                        Tutup Detail
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

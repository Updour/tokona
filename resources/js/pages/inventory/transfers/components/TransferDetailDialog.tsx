import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ArrowRightLeft, Clock, Truck, PackageOpen, CheckCircle2, FileText, CalendarDays } from 'lucide-react';
import { useTransferStore } from '../stores/useTransferStore';

export default function TransferDetailDialog() {
    const { detailTransfer: transfer, closeDetail } = useTransferStore();
    const isOpen = !!transfer;

    if (!transfer) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge className="bg-slate-100 text-slate-700 border-0 flex w-fit items-center gap-1.5 px-2.5 py-0.5"><Clock className="w-3.5 h-3.5"/> Draft</Badge>;
            case 'SHIPPED':
                return <Badge className="bg-amber-100 text-amber-700 border-0 flex w-fit items-center gap-1.5 px-2.5 py-0.5"><Truck className="w-3.5 h-3.5"/> Dikirim</Badge>;
            case 'PARTIAL':
                return <Badge className="bg-blue-100 text-blue-700 border-0 flex w-fit items-center gap-1.5 px-2.5 py-0.5"><PackageOpen className="w-3.5 h-3.5"/> Sebagian</Badge>;
            case 'RECEIVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 flex w-fit items-center gap-1.5 px-2.5 py-0.5"><CheckCircle2 className="w-3.5 h-3.5"/> Diterima</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDetail()}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50/50 dark:bg-background">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileText className="h-5 w-5 text-primary" />
                                Detail Transfer Barang
                            </DialogTitle>
                            <DialogDescription className="mt-1.5">
                                Informasi lengkap riwayat transfer antar cabang.
                            </DialogDescription>
                        </div>
                        {getStatusBadge(transfer.status)}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Informasi Utama */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informasi Transaksi</h4>
                            <div className="grid grid-cols-3 gap-y-3 text-sm">
                                <span className="text-muted-foreground col-span-1">No. Referensi</span>
                                <span className="font-medium text-foreground col-span-2">: {transfer.reference_number}</span>
                                
                                <span className="text-muted-foreground col-span-1">Tgl Dibuat</span>
                                <span className="font-medium text-foreground col-span-2 flex items-center gap-1.5">
                                    : {new Date(transfer.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                
                                <span className="text-muted-foreground col-span-1">Tgl Dikirim</span>
                                <span className="font-medium text-foreground col-span-2">
                                    : {transfer.sent_at ? new Date(transfer.sent_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                                
                                <span className="text-muted-foreground col-span-1">Tgl Diterima</span>
                                <span className="font-medium text-foreground col-span-2">
                                    : {transfer.received_at ? new Date(transfer.received_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Rute Transfer */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rute Pengiriman</h4>
                            <div className="flex flex-col gap-3 relative">
                                <div className="absolute top-4 bottom-4 left-[15px] border-l-2 border-dashed border-muted-foreground/30"></div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Cabang Asal</span>
                                        <span className="font-semibold text-sm">{transfer.source_branch?.name || '-'}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Cabang Tujuan</span>
                                        <span className="font-semibold text-sm">{transfer.destination_branch?.name || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {transfer.notes && (
                        <div className="mb-6 p-4 bg-muted/40 rounded-lg border">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Catatan Tambahan</h4>
                            <p className="text-sm italic text-foreground">{transfer.notes}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Daftar Barang</h4>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Nama Barang</TableHead>
                                        <TableHead className="text-center font-semibold w-24">Dikirim</TableHead>
                                        <TableHead className="text-center font-semibold w-24">Diterima</TableHead>
                                        <TableHead className="text-center font-semibold w-24">Selisih</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfer.items?.map((item: any) => {
                                        const unreceived = item.shipped_qty - item.received_qty;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.product?.name || 'Produk Tidak Diketahui'}
                                                    {item.product?.sku && <span className="block text-xs text-muted-foreground font-normal">{item.product.sku}</span>}
                                                </TableCell>
                                                <TableCell className="text-center bg-amber-50/30 font-medium">
                                                    {item.shipped_qty}
                                                </TableCell>
                                                <TableCell className="text-center bg-emerald-50/30 font-medium text-emerald-700">
                                                    {item.received_qty}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {unreceived > 0 ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">-{unreceived}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

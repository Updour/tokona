import React from 'react';
import { ArrowRightLeft, Truck, CheckCircle2, Clock, PackageOpen, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { useTransferStore } from '../stores/useTransferStore';

interface Props {
    transfers: any;
    handleShip: (transfer: any) => void;
}

export default function TransferTable({ transfers, handleShip }: Props) {
    const { openReceive, openDetail } = useTransferStore();
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 flex w-fit items-center gap-1"><Clock className="w-3 h-3"/> Draft</Badge>;
            case 'SHIPPED':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 flex w-fit items-center gap-1"><Truck className="w-3 h-3"/> Dikirim</Badge>;
            case 'PARTIAL':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 flex w-fit items-center gap-1"><PackageOpen className="w-3 h-3"/> Sebagian</Badge>;
            case 'RECEIVED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex w-fit items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Diterima</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <>
            <div className="rounded-md border overflow-hidden mt-2">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold py-4">Tanggal</TableHead>
                            <TableHead className="font-semibold py-4">No Referensi</TableHead>
                            <TableHead className="font-semibold py-4 w-[200px]">Rute Transfer</TableHead>
                            <TableHead className="font-semibold py-4 text-center">Jml Item</TableHead>
                            <TableHead className="font-semibold py-4">Status</TableHead>
                            <TableHead className="font-semibold py-4 text-right w-[80px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-card">
                        {transfers?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    <ArrowRightLeft className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                    Belum ada riwayat Transfer Antar Cabang yang cocok.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transfers?.data?.map((transfer: any) => (
                                <TableRow key={transfer.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="font-medium">{new Date(transfer.created_at).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="font-semibold">{transfer.reference_number}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-xs text-muted-foreground shrink-0 w-24 truncate" title={transfer.source_branch?.name || 'Pusat'}>
                                                {transfer.source_branch?.name || 'Pusat'}
                                            </span>
                                            <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                            <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20 truncate max-w-[120px]" title={transfer.destination_branch?.name}>
                                                {transfer.destination_branch?.name}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-slate-600 dark:text-slate-300">
                                        {transfer.items?.length || 0}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(transfer.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50">
                                                    <span className="sr-only">Buka menu aksi</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem onClick={() => openDetail(transfer)}>
                                                    <PackageOpen className="w-4 h-4 mr-2 text-primary" />
                                                    Detail Transfer
                                                </DropdownMenuItem>
                                                {transfer.status === 'DRAFT' && (
                                                    <DropdownMenuItem onClick={() => handleShip(transfer)}>
                                                        <Truck className="w-4 h-4 mr-2 text-amber-600" />
                                                        Kirim (Ship)
                                                    </DropdownMenuItem>
                                                )}
                                                {(transfer.status === 'SHIPPED' || transfer.status === 'PARTIAL') && (
                                                    <DropdownMenuItem onClick={() => openReceive(transfer)}>
                                                        <PackageOpen className="w-4 h-4 mr-2 text-blue-600" />
                                                        Terima Barang
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {transfers?.data?.length > 0 && transfers.links && (
                <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan <span className="font-medium text-foreground">{transfers.from}</span> - <span className="font-medium text-foreground">{transfers.to}</span> dari <span className="font-medium text-foreground">{transfers.total}</span> data
                    </div>
                    <div className="flex gap-1">
                        {transfers.links.map((link: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`inline-flex items-center justify-center rounded-md h-8 min-w-8 px-3 text-xs font-medium transition-colors border
                                    ${link.active 
                                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                                        : 'bg-background hover:bg-muted'}
                                    ${!link.url ? 'opacity-50 cursor-not-allowed border-transparent' : ''}
                                `}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

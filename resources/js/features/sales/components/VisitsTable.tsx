import { useState } from 'react';
import { Store, MapPin, ClipboardCheck, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VisitDetailsDialog } from './VisitDetailsDialog';
import type { SalesVisit } from '../types';

interface VisitsTableProps {
    visits: SalesVisit[];
}

export function VisitsTable({ visits }: VisitsTableProps) {
    const [selectedVisit, setSelectedVisit] = useState<SalesVisit | null>(null);

    return (
        <>
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-black text-slate-800">Sales Representative</TableHead>
                            <TableHead className="font-black text-slate-800">Outlet Toko</TableHead>
                            <TableHead className="font-black text-slate-800">Waktu Kunjungan</TableHead>
                            <TableHead className="font-black text-slate-800">Hasil Kunjungan</TableHead>
                            <TableHead className="font-black text-slate-800">Catatan Lapangan</TableHead>
                            <TableHead className="text-right font-black text-slate-800">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visits.length > 0 ? (
                            visits.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-bold text-indigo-900">
                                        {item.sales_person?.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Store className="h-4 w-4 text-slate-400 shrink-0" />
                                            <div>
                                                <div className="font-bold text-slate-850">{item.customer?.name ?? 'Toko Mitra'}</div>
                                                <div className="text-[10px] text-slate-450 font-bold flex items-center gap-0.5">
                                                    <MapPin className="h-3 w-3 text-indigo-500" /> GPS Check-in Terverifikasi
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700 text-sm">
                                        {item.visited_at ? new Date(item.visited_at).toLocaleString('id-ID') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.status === 'ordered' ? (
                                            <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] border-0 px-2 py-0.5">
                                                <ClipboardCheck className="h-3 w-3 mr-1" /> Buat Order
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-200 text-slate-700 font-extrabold text-[10px] border-0 px-2 py-0.5" variant="outline">
                                                <Eye className="h-3 w-3 mr-1" /> Cek Toko
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 max-w-[240px] truncate">
                                        {item.notes ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            onClick={() => setSelectedVisit(item)}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs font-black border-slate-200 hover:bg-slate-100 bg-white"
                                        >
                                            <FileText className="h-3.5 w-3.5 mr-1 text-slate-500" /> Detail
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-slate-500 py-12 font-semibold">
                                    Tidak ada riwayat kunjungan yang sesuai filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <VisitDetailsDialog
                visit={selectedVisit}
                open={!!selectedVisit}
                onOpenChange={(open) => !open && setSelectedVisit(null)}
            />
        </>
    );
}

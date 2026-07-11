import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CheckCircle2, ClipboardList, Clock, XCircle } from 'lucide-react';
import { OpnameFilters } from './OpnameFilters';
import { useOpnameStore } from '../stores/useOpnameStore';

interface PageProps {
    [key: string]: any;
    opnames: {
        data: any[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: Record<string, any>;
}

export default function OpnameTable({ opnames, filters }: { opnames: any, filters: any }) {
    const { openCreate, openDetail } = useOpnameStore();

    const handleExport = () => {
        window.location.href = '/inventory/opname/export?' + new URLSearchParams(filters as Record<string, string>).toString();
    };

    return (
        <div className="w-full space-y-4">
            <OpnameFilters
                filters={filters}
                totalResults={opnames?.total ?? 0}
                onAddClick={() => openCreate()}
                onExport={handleExport}
            />

            <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold py-4">Tanggal</TableHead>
                            <TableHead className="font-bold py-4">No Referensi</TableHead>
                            <TableHead className="font-bold py-4">Auditor</TableHead>
                            <TableHead className="font-bold py-4 text-center">Jml Item</TableHead>
                            <TableHead className="font-bold py-4">Catatan</TableHead>
                            <TableHead className="font-bold py-4">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {opnames?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                    <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                    Belum ada riwayat Stock Opname.
                                </TableCell>
                            </TableRow>
                        ) : (
                            opnames?.data?.map((opname: any) => (
                                <TableRow 
                                    key={opname.id} 
                                    className="hover:bg-slate-50/50 cursor-pointer"
                                    onClick={() => openDetail(opname)}
                                >
                                    <TableCell className="font-medium">{new Date(opname.opname_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="font-bold text-indigo-650">{opname.reference_number}</TableCell>
                                    <TableCell>{opname.creator?.name}</TableCell>
                                    <TableCell className="text-center font-bold text-slate-600">{opname.items?.length || 0}</TableCell>
                                    <TableCell className="text-slate-500 max-w-[200px] truncate" title={opname.notes}>{opname.notes || '-'}</TableCell>
                                    <TableCell>
                                        {opname.status === 'draft' && (
                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                                <Clock className="h-3 w-3" /> Draft
                                            </Badge>
                                        )}
                                        {opname.status === 'completed' && (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                                <CheckCircle2 className="h-3 w-3" /> Selesai
                                            </Badge>
                                        )}
                                        {opname.status === 'cancelled' && (
                                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                                <XCircle className="h-3 w-3" /> Dibatalkan
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination 
                data={opnames as any} 
                itemName="riwayat" 
                filters={filters} 
            />
        </div>
    );
}

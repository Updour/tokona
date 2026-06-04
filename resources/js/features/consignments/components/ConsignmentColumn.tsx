import type { ColumnDef } from '@tanstack/react-table';
import { HandCoins, CheckCircle2, Clock, Eye, Edit } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatTimeAgo } from '@/lib/helpers/date';
import { formatDateTime, formatRupiah } from '@/lib/helpers/format';
import { useConsignmentStore } from '@/features/consignments/stores/useConsignmentStore';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'consignment_date',
        header: 'Tanggal Titip',
        cell: ({ row }) => {
            const dateStr = row.getValue('consignment_date') || row.getValue('created_at');
            return (
                <div className="flex flex-col">
                    <span className="text-xs font-medium">{formatDateTime(dateStr as string).substring(0, 11)}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(dateStr as string)}</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'due_date',
        header: 'Jatuh Tempo',
        cell: ({ row }) => {
            const due = row.getValue('due_date');
            const status = row.getValue('status');
            if (!due) return <span className="text-xs text-muted-foreground">-</span>;

            const isLate = status === 'active' && new Date(due as string) < new Date();
            return (
                <div className="flex flex-col">
                    <span className={`text-xs font-medium ${isLate ? 'text-red-600' : ''}`}>
                        {formatDateTime(due as string).substring(0, 11)}
                    </span>
                    <span className={`text-[10px] ${isLate ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                        {status === 'active' ? formatTimeAgo(due as string) : 'Selesai'}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'supplier',
        accessorFn: (row) => row.supplier?.name,
        header: 'Supplier',
        cell: ({ row }) => <span className="font-bold">{row.getValue('supplier') || '-'}</span>,
    },
    {
        id: 'branch',
        accessorFn: (row) => row.branch?.name,
        header: 'Cabang',
        cell: ({ row }) => <span className="text-xs">{row.getValue('branch') || '-'}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status');
            return status === 'settled'
                ? <Badge variant="default" className="bg-green-600 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Selesai</Badge>
                : <Badge variant="secondary" className="text-[10px]"><Clock className="h-3 w-3 mr-1" /> Berjalan</Badge>;
        },
    },
    {
        id: 'summary',
        header: 'Ringkasan',
        cell: ({ row }) => {
            const rowData = row.original;
            const totalItems = rowData.items?.reduce((acc: number, curr: any) => acc + curr.qty_received, 0) || 0;

            if (rowData.status === 'settled') {
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">{totalItems} pcs diterima</span>
                        <span className="font-bold text-green-700">Dibayar: {formatRupiah(rowData.total_paid)}</span>
                    </div>
                );
            }

            return <span className="text-xs text-muted-foreground">{totalItems} pcs</span>;
        }
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const consignment = row.original;
            const openSettleForm = useConsignmentStore((state) => state.openSettleForm);
            const openDetailForm = useConsignmentStore((state) => state.openDetailForm);
            const openEditForm = useConsignmentStore((state) => state.openEditForm);

            return (
                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        {consignment.status === 'active' && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                            onClick={() => openEditForm(consignment)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Titipan</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                            onClick={() => openSettleForm(consignment)}
                                        >
                                            <HandCoins className="h-3.5 w-3.5 mr-1" /> Setor
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Setor Pembayaran ke Supplier</TooltipContent>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                    onClick={() => openDetailForm(consignment)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            );
        },
    },
];

import { createColumnHelper } from '@tanstack/react-table';
import { HandCoins, CheckCircle2, Clock } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/helpers/format';

const columnHelper = createColumnHelper<any>();

export function useConsignmentColumns(openSettleForm: (row: any) => void) {
    return [
        columnHelper.accessor('created_at', {
            header: 'Tanggal Titip',
            cell: (info) => <span className="text-xs font-medium">{formatDateTime(info.getValue())}</span>,
        }),
        columnHelper.accessor('supplier.name', {
            header: 'Supplier',
            cell: (info) => <span className="font-bold">{info.getValue() || '-'}</span>,
        }),
        columnHelper.accessor('branch.name', {
            header: 'Cabang',
            cell: (info) => <span className="text-xs">{info.getValue() || '-'}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue();
                return status === 'settled' 
                    ? <Badge variant="default" className="bg-green-600 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Selesai</Badge>
                    : <Badge variant="secondary" className="text-[10px]"><Clock className="h-3 w-3 mr-1" /> Berjalan</Badge>;
            },
        }),
        columnHelper.display({
            id: 'summary',
            header: 'Ringkasan',
            cell: (info) => {
                const row = info.row.original;
                const totalItems = row.items?.reduce((acc: number, curr: any) => acc + curr.qty_received, 0) || 0;
                
                if (row.status === 'settled') {
                    return (
                        <div className="flex flex-col text-xs">
                            <span className="text-muted-foreground">{totalItems} pcs diterima</span>
                            <span className="font-bold text-green-700">Dibayar: {formatRupiah(row.total_paid)}</span>
                        </div>
                    );
                }
                
                return <span className="text-xs text-muted-foreground">{totalItems} pcs</span>;
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: (info) => {
                const row = info.row.original;
                if (row.status === 'active') {
                    return (
                        <Button size="sm" variant="outline" className="h-7 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" onClick={() => openSettleForm(row)}>
                            <HandCoins className="h-3.5 w-3.5 mr-1" /> Setor
                        </Button>
                    );
                }
                return null;
            },
        }),
    ];
}

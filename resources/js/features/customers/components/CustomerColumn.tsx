import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/helpers/format';
import { formatDateTime, formatTimeAgo } from '@/lib/helpers/date';
import { Eye } from 'lucide-react';
import { useCustomerStore } from '@/pages/customers/stores/useCustomerStore';

const ActionCell = ({ row, onEdit, onView }: { row: any, onEdit: any, onView: any }) => {
    const { openDelete } = useCustomerStore();
    const customer = row.original;

    return (
        <div className="text-right flex items-center justify-end">
            <Button variant="ghost" size="icon" onClick={() => onView(customer)} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openDelete(customer)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

export const getCustomerColumns = (onEdit: (c: any) => void, onView: (c: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: 'name',
        header: 'Nama Pelanggan',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                    {row.original.is_active ? (
                        <span className="text-green-600 font-semibold">• Aktif</span>
                    ) : (
                        <span className="text-red-500 font-semibold">• Nonaktif</span>
                    )}
                </span>
            </div>
        ),
    },
    {
        id: 'contact',
        header: 'Kontak (HP/Email)',
        cell: ({ row }) => (
            <div className="flex flex-col text-xs">
                <span>{row.original.phone || '-'}</span>
                <span className="text-muted-foreground">{row.original.email}</span>
            </div>
        ),
    },
    {
        accessorKey: 'tier',
        header: 'Level (Tier)',
        cell: ({ row }) => {
            const tier = row.original.tier;

            return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tier === 'distributor' ? 'bg-purple-100 text-purple-700' :
                    tier === 'wholesale' ? 'bg-blue-100 text-blue-700' :
                        tier === 'member' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {tier.toUpperCase()}
                </span>
            );
        },
    },
    {
        accessorKey: 'debt_balance',
        header: 'Piutang',
        cell: ({ row }) => (
            <span className="text-red-600 font-semibold">
                {formatRupiah(row.original.debt_balance)}
            </span>
        ),
    },
    {
        id: 'registered_at',
        header: 'Daftar / Terakhir Aktif',
        cell: ({ row }) => (
            <div className="flex flex-col text-xs text-muted-foreground whitespace-nowrap">
                <span title="Tanggal Daftar" className='text-green-600 font-semibold' >Daftar: {row.original.created_at ? formatDateTime(row.original.created_at).split(',')[0] : '-'}</span>
                <span title="Terakhir Aktif">Aktif: {row.original.updated_at ? formatTimeAgo(row.original.updated_at) : '-'}</span>
            </div>
        ),
    },
    {
        id: 'last_transaction',
        header: 'Terakhir Transaksi',
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
                {row.original.last_transaction_at ? (
                    <div className="flex flex-col">
                        <span>{formatDateTime(row.original.last_transaction_at)}</span>
                        <span className="text-[10px]">{formatTimeAgo(row.original.last_transaction_at)}</span>
                    </div>
                ) : '-'}
            </span>
        ),
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onView={onView} />,
    },
];

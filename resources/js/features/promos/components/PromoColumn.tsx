import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/helpers/format';
import { formatDateTime } from '@/lib/helpers/date';
import { usePromoStore } from '@/pages/promos/stores/usePromoStore';

const ActionCell = ({ row, onEdit }: { row: any, onEdit: any }) => {
    const { openDelete } = usePromoStore();
    const promo = row.original;

    return (
        <div className="text-right">
            <Button variant="ghost" size="icon" onClick={() => onEdit(promo)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openDelete(promo)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

export const getPromoColumns = (onEdit: (p: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: 'name',
        header: 'Nama Promo / Aturan',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: 'type',
        header: 'Tipe Diskon',
        cell: ({ row }) => {
            const type = row.original.type;

            return (
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    type === 'percentage' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                    {type === 'percentage' ? 'Persentase (%)' : 'Rupiah (Rp)'}
                </span>
            );
        },
    },
    {
        accessorKey: 'value',
        header: 'Nilai Potongan',
        cell: ({ row }) => {
            const promo = row.original;

            return (
                <span className="font-bold text-primary">
                    {promo.type === 'percentage' ? `${Number(promo.value)}%` : formatRupiah(promo.value)}
                </span>
            );
        },
    },
    {
        id: 'requirements',
        header: 'Syarat Min. Beli',
        cell: ({ row }) => {
            const promo = row.original;

            return (
                <div className="flex flex-col text-xs text-muted-foreground">
                    <span>Qty: {promo.min_qty > 0 ? `${promo.min_qty} Pcs` : 'Tanpa Syarat'}</span>
                    {promo.min_amount > 0 && <span>Min. {formatRupiah(promo.min_amount)}</span>}
                </div>
            );
        },
    },
    {
        id: 'period',
        header: 'Masa Berlaku',
        cell: ({ row }) => {
            const promo = row.original;

            return (
                <span className="text-xs">
                    {promo.start_date ? formatDateTime(promo.start_date).split(',')[0] : 'Selamanya'}
                    {promo.end_date && ` - ${formatDateTime(promo.end_date).split(',')[0]}`}
                </span>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.original.is_active;

            return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {isActive ? 'Aktif' : 'Mati'}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} />,
    },
];

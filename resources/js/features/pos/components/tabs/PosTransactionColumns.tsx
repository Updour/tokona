import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Printer, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah } from '@/lib/helpers/format';

interface PosTransactionColumnProps {
    setSelectedDetailTransaction: (tx: any) => void;
    setShowDetailModal: (show: boolean) => void;
    handleReprint: (tx: any) => void;
    setPayDebtTransaction: (tx: any) => void;
    setShowPayDebtDialog: (show: boolean) => void;
}

export const getPosTransactionColumns = ({
    setSelectedDetailTransaction,
    setShowDetailModal,
    handleReprint,
    setPayDebtTransaction,
    setShowPayDebtDialog
}: PosTransactionColumnProps): ColumnDef<any>[] => [
    {
        accessorKey: 'created_at',
        header: () => <div className="h-9 flex items-center py-1 text-xs">Tanggal & Waktu</div>,
        cell: ({ row }) => (
            <div className="font-mono text-[11px] text-slate-600 py-1">
                {new Date(row.original.created_at).toLocaleString('id-ID')}
            </div>
        )
    },
    {
        accessorKey: 'invoice_number',
        header: () => <div className="h-9 flex items-center py-1 text-xs">No. Faktur</div>,
        cell: ({ row }) => {
            const tx = row.original;

            return (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedDetailTransaction(tx);
                        setShowDetailModal(true);
                    }}
                    className="hover:underline text-primary text-left cursor-pointer transition-all active:scale-[0.97] font-bold text-slate-800 text-xs py-1"
                    title="Klik untuk melihat detail lengkap transaksi"
                >
                    {tx.invoice_number}
                </button>
            );
        }
    },
    {
        accessorFn: (row) => row.customer?.name ?? 'Pelanggan Umum',
        id: 'customer',
        header: () => <div className="h-9 flex items-center py-1 text-xs">Pelanggan</div>,
        cell: ({ getValue }) => (
            <div className="text-xs font-medium text-slate-700 py-1">{getValue() as string}</div>
        )
    },
    {
        accessorKey: 'payment_method',
        header: () => <div className="h-9 flex items-center py-1 text-xs">Metode Bayar</div>,
        cell: ({ row }) => {
            const method = row.original.payment_method;
            const label = method === 'cash' ? 'Tunai' : method === 'transfer' ? 'Transfer' : method === 'split' ? 'Split' : 'Hutang';

            return <div className="capitalize text-xs font-semibold text-slate-600 py-1">{label}</div>;
        }
    },
    {
        accessorKey: 'total',
        header: () => <div className="h-9 flex items-center justify-end py-1 text-xs">Total Transaksi</div>,
        cell: ({ row }) => (
            <div className="text-right font-mono font-bold text-slate-900 text-xs py-1">
                {formatRupiah(parseFloat(row.original.total))}
            </div>
        )
    },
    {
        accessorKey: 'status',
        header: () => <div className="h-9 flex items-center justify-center py-1 text-xs">Status</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            const badgeClass = status === 'paid' ? 'bg-emerald-500 text-white' : status === 'returned' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white';
            const label = status === 'paid' ? 'Lunas' : status === 'returned' ? 'Diretur' : 'Kredit';

            return (
                <div className="text-center py-1">
                    <Badge className={`border-0 font-extrabold text-[10px] px-2 py-0 h-5 ${badgeClass}`}>
                        {label}
                    </Badge>
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: () => <div className="h-9 flex items-center justify-center py-1 text-xs">Aksi</div>,
        cell: ({ row }) => {
            const tx = row.original;

            return (
                <div className="flex justify-center items-center gap-1 py-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedDetailTransaction(tx);
                                        setShowDetailModal(true);
                                    }}
                                    className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail Transaksi</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleReprint(tx)}
                                    className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cetak Struk</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {tx.payment_method === 'debt' && tx.status !== 'paid' && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setPayDebtTransaction(tx);
                                            setShowPayDebtDialog(true);
                                        }}
                                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                    >
                                        <Wallet className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Pelunasan Piutang</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            );
        }
    }
];

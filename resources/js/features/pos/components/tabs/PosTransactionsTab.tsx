import { formatNumber, formatDateTime } from '@/lib/helpers/format';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPosTransactionColumns } from './PosTransactionColumns';
import { PosTransactionFilters } from './PosTransactionFilters';

interface PosTransactionsTabProps {
    transactions: any[];
    setSelectedDetailTransaction: (tx: any) => void;
    setShowDetailModal: (show: boolean) => void;
    handleReprint: (tx: any) => void;
    setPayDebtTransaction: (tx: any) => void;
    setShowPayDebtDialog: (show: boolean) => void;
}

export function PosTransactionsTab({
    transactions,
    setSelectedDetailTransaction,
    setShowDetailModal,
    handleReprint,
    setPayDebtTransaction,
    setShowPayDebtDialog
}: PosTransactionsTabProps) {
    const [search, setSearch] = useState('');
    const [localFilters, setLocalFilters] = useState({
        payment_method: 'all',
        status: 'all',
        date_range: 'all'
    });
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({
            payment_method: 'all',
            status: 'all',
            date_range: 'all'
        });
        setPage(1);
    };
    
    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx: any) => {
            const matchesSearch =
                tx.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
                (tx.customer?.name ?? 'pelanggan umum').toLowerCase().includes(search.toLowerCase());

            const matchesPayment = localFilters.payment_method === 'all' || tx.payment_method === localFilters.payment_method;
            const matchesStatus = localFilters.status === 'all' || tx.status === localFilters.status;

            let matchesDate = true;

            if (localFilters.date_range !== 'all') {
                const txDate = new Date(tx.created_at);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (localFilters.date_range === 'today') {
                    matchesDate = txDate >= today;
                } else if (localFilters.date_range === 'yesterday') {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const endOfYesterday = new Date(today);
                    endOfYesterday.setMilliseconds(-1);
                    matchesDate = txDate >= yesterday && txDate <= endOfYesterday;
                } else if (localFilters.date_range === 'this_week') {
                    const oneWeekAgo = new Date(today);
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    matchesDate = txDate >= oneWeekAgo;
                } else if (localFilters.date_range === 'this_month') {
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    matchesDate = txDate >= startOfMonth;
                }
            }

            return matchesSearch && matchesPayment && matchesStatus && matchesDate;
        });
    }, [transactions, search, localFilters]);

    // Calculate paginated data
    const paginatedTransactions = useMemo(() => {
        const start = (page - 1) * perPage;

        return filteredTransactions.slice(start, start + perPage);
    }, [filteredTransactions, page, perPage]);

    const handleExport = () => {
        if (!filteredTransactions.length) {
return;
}

        const rows = filteredTransactions.map((tx) => ({
            Tanggal: formatDateTime(tx.created_at),
            'No Faktur': tx.invoice_number,
            Pelanggan: tx.customer?.name ?? 'Pelanggan Umum',
            'Metode Pembayaran': tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method === 'transfer' ? 'Transfer' : tx.payment_method === 'split' ? 'Split' : 'Hutang',
            Total: parseFloat(tx.total),
            Status: tx.status === 'paid' ? 'Lunas' : tx.status === 'returned' ? 'Diretur' : 'Kredit'
        }));

        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((r) =>
                headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `riwayat_transaksi_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    const columns = useMemo(() => getPosTransactionColumns({
        setSelectedDetailTransaction,
        setShowDetailModal,
        handleReprint,
        setPayDebtTransaction,
        setShowPayDebtDialog
    }), [setSelectedDetailTransaction, setShowDetailModal, handleReprint, setPayDebtTransaction, setShowPayDebtDialog]);

    const table = useReactTable({
        data: paginatedTransactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4 h-full flex flex-col overflow-hidden">
            <PosTransactionFilters 
                search={search}
                setSearch={setSearch}
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                filteredCount={filteredTransactions.length}
                handleExport={handleExport}
                resetFilters={resetFilters}
            />

            {/* Table matched to ProductTable style */}
            <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border bg-white">
                <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="h-9 border-b border-slate-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-9 py-1 px-3 text-xs bg-muted/40 text-slate-700 font-bold whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-slate-50/50 h-10 border-b border-slate-100 last:border-0 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-3 py-1">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground text-xs font-medium">
                                    Tidak ada transaksi yang cocok dengan filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            {filteredTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4 text-xs text-muted-foreground w-full bg-slate-50/80 border-t border-slate-200 rounded-b-md mt-auto shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500">Tampilkan</span>
                            <Select value={perPage.toString()} onValueChange={(v) => {
 setPerPage(Number(v)); setPage(1); 
}}>
                                <SelectTrigger className="h-7 w-[70px] text-xs font-bold border-slate-200 bg-white">
                                    <SelectValue placeholder="15" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 15, 20, 25, 50, 100].map((size) => (
                                        <SelectItem key={size} value={size.toString()} className="text-xs">{size} baris</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="hidden sm:inline-block border-l pl-4 border-slate-200 font-medium">
                            Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredTransactions.length)} dari {formatNumber(filteredTransactions.length)} transaksi
                        </span>
                    </div>
                    <div className="flex gap-1.5 items-center flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-7 px-3 text-xs font-semibold bg-white shadow-sm"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page * perPage >= filteredTransactions.length}
                            onClick={() => setPage(page + 1)}
                            className="h-7 px-3 text-xs font-semibold bg-white shadow-sm"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

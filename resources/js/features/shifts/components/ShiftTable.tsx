import { Link, router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Search, Eye, StopCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useShiftStore } from '@/pages/shifts/stores/useShiftStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah, formatDateTime, formatNumber } from '@/lib/helpers/format';
import type { Shift } from '../types';

interface Props {
    shifts: any;
    filters: any;
}

export function ShiftTable({ shifts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { openClose } = useShiftStore();

    const onSearch = debounce((val: string) => {
        router.get('/shifts', { search: val || undefined, status: filters.status }, { preserveState: true, replace: true });
    }, 400);

    const onStatusChange = (val: string) => {
        router.get('/shifts', { search: search || undefined, status: val === 'ALL' ? undefined : val }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/shifts', {}, { preserveState: false, replace: true });
    };

    return (
        <div className="space-y-4">
            {/* Filter Bar (Desain premium seperti filter produk) */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Cari Kasir */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama kasir..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value); onSearch(e.target.value);
                        }}
                        className="pl-8 h-9 text-xs"
                    />
                    {search && (
                        <button onClick={() => {
                            setSearch(''); onSearch('');
                        }} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Status */}
                <Select defaultValue={filters.status || 'ALL'} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                        <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="open">Aktif (Buka)</SelectItem>
                        <SelectItem value="closed">Ditutup</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset button */}
                {((filters.status && filters.status !== 'ALL') || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatNumber(shifts.total)} shift ditemukan
                </span>
            </div>

            {/* Table (Desain premium seperti tabel produk) */}
            <div className="rounded-lg border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10">
                        <TableRow>
                            <TableHead>Kasir</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead>Dibuka</TableHead>
                            <TableHead>Ditutup</TableHead>
                            <TableHead className="text-right">Saldo Awal</TableHead>
                            <TableHead className="text-right">Saldo Akhir</TableHead>
                            <TableHead className="text-center">Transaksi</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shifts.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                    Tidak ada data shift yang cocok dengan filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            shifts.data.map((s: Shift) => (
                                <TableRow key={s.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-bold text-slate-800">{s.user?.name || '-'}</TableCell>
                                    <TableCell className="text-xs font-semibold text-slate-600">{s.branch?.name || '-'}</TableCell>
                                    <TableCell className="text-xs text-slate-600 font-mono">{formatDateTime(s.opened_at)}</TableCell>
                                    <TableCell className="text-xs text-slate-600 font-mono">{s.closed_at ? formatDateTime(s.closed_at) : '-'}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-slate-900">{formatRupiah(s.opening_balance)}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-slate-900">{s.closing_balance !== null ? formatRupiah(s.closing_balance) : '-'}</TableCell>
                                    <TableCell className="text-center font-bold text-slate-700">{s.transactions_count ?? 0}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            className={`border-0 font-extrabold text-[10px] ${s.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}
                                        >
                                            {s.status === 'open' ? 'Aktif' : 'Ditutup'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50" asChild>
                                                            <Link href={`/shifts/${s.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Lihat Detail Shift</TooltipContent>
                                                </Tooltip>
                                                {s.status === 'open' && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                                onClick={() => openClose(s)}
                                                            >
                                                                <StopCircle className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Tutup Shift</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination data={shifts} itemName="shift" filters={filters} />


        </div>
    );
}

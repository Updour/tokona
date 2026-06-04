import { Head, router } from '@inertiajs/react';
import { Search, X, Receipt, ArrowUpRight, ArrowDownRight, Scale, PiggyBank, Landmark, CircleAlert, Download, SlidersHorizontal, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import MainLayout from '@/layouts/app/app-main-layout';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';

export default function CashBooks({ cashBooks, branches, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const activeFilterCount = [
        branchFilter !== 'ALL' && branchFilter !== '',
    ].filter(Boolean).length;

    const applyFilters = (s = search, br = branchFilter) => {
        setIsFilterOpen(false);
        router.get('/cash-books', {
            search: s || undefined,
            branch_id: br !== 'ALL' ? br : undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, branchFilter);
        }, 350);

        return () => clearTimeout(handler);
    };

    const handleReset = () => {
        setSearch('');
        setBranchFilter('ALL');
        setIsFilterOpen(false);
        router.get('/cash-books', {}, { replace: true });
    };

    const handleExport = () => {
        if (!cashBooks?.data?.length) return;
        const rows = cashBooks.data.map((c: any) => ({
            'Tanggal': c.created_at,
            'Arah': c.type === 'in' ? 'MASUK' : 'KELUAR',
            'Kategori': c.category,
            'Keterangan': c.note,
            'Cabang': c.branch?.name || '-',
            'Nominal': c.amount,
        }));
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((r: any) =>
                headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `buku_kas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <MainLayout>
            <Head title="Kas & Saldo Toko (Cash Ledger)" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Scale className="h-6 w-6 text-indigo-600" /> Buku Kas & Mutasi Saldo
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Jurnal transaksi gabungan yang menyatukan seluruh mutasi uang masuk dan pengeluaran secara kronologis guna memantau sisa saldo bersih kas Anda.
                    </p>
                </div>

                {/* Dashboard Analitik Mutasi Kas Utama (Golden Premium Card for net balance!) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-emerald-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Pemasukan Kas</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-emerald-600">
                                + {formatRupiah(stats.cash_in)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Akumulasi uang masuk (POS + manual)</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-red-500 bg-red-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Pengeluaran Kas</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-red-600">
                                - {formatRupiah(stats.cash_out)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Akumulasi biaya operasional + kas keluar</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border border-indigo-200 bg-indigo-50/50">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold uppercase text-indigo-700">Sisa Saldo Kas Bersih</CardTitle>
                            <Landmark className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className={`text-2xl font-black ${stats.balance >= 0 ? 'text-indigo-700' : 'text-red-700 animate-pulse'}`}>
                                {formatRupiah(stats.balance)}
                            </div>
                            <p className="text-xs text-indigo-600 mt-1 font-semibold flex items-center gap-1">
                                {stats.balance >= 0 ? 'Kas dalam kondisi positif & aman.' : <><CircleAlert className="h-3 w-3" /> Kas defisit! Periksa pengeluaran.</>}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Saringan Filter Pencarian */}
                <div className="space-y-3">
                    <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari deskripsi mutasi..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-8 h-9 text-sm"
                            />
                            {search && (
                                <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 h-9">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[340px] p-0" align="start">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <p className="text-sm font-semibold">Filter Mutasi</p>
                                    {activeFilterCount > 0 && (
                                        <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                            <X className="h-3 w-3" /> Reset
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3" /> Cabang
                                        </Label>
                                        <Select value={branchFilter || 'ALL'} onValueChange={(v) => setBranchFilter(v)}>
                                            <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Cabang" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">Semua Cabang</SelectItem>
                                                {branches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="px-4 py-3 border-t">
                                    <Button className="w-full" size="sm" onClick={() => applyFilters()}>
                                        Terapkan Filter
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {(search || activeFilterCount > 0) && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                                <X className="h-3.5 w-3.5" /> Reset
                            </Button>
                        )}
                        
                        <div className="flex-1" />

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 text-xs"
                            onClick={handleExport}
                            disabled={!cashBooks?.data?.length}
                        >
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </div>

                    {/* Active filter chips */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {(branchFilter !== 'ALL' && branchFilter !== '') && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                                    Cabang: {branches?.find((b: any) => b.id === branchFilter)?.name ?? '...'}
                                    <button onClick={() => { setBranchFilter('ALL'); applyFilters(search, 'ALL'); }} className="hover:text-destructive ml-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex-1" />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs"
                        onClick={handleExport}
                        disabled={!cashBooks?.data?.length}
                    >
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                </div>

                {/* Tabel Jurnal Mutasi Kas */}
                <Card className="shadow-sm border">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[150px]">Tanggal / Waktu</TableHead>
                                    <TableHead className="w-[100px]">Arah Arus</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Keterangan Mutasi</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead className="text-right w-[180px]">Nominal Transaksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashBooks?.data?.length ? (
                                    cashBooks.data.map((c: any) => {
                                        const isIn = c.type === 'in';

                                        return (
                                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-mono text-xs text-slate-600">
                                                    {formatDateTime(c.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`gap-1 font-bold ${
                                                            isIn 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                    >
                                                        {isIn ? (
                                                            <><ArrowUpRight className="h-3 w-3" /> MASUK</>
                                                        ) : (
                                                            <><ArrowDownRight className="h-3 w-3" /> KELUAR</>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize font-medium text-slate-700 text-xs">
                                                    {c.category.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-800">{c.note}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {c.branch?.name || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-mono text-xs font-bold ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {isIn ? '+' : '-'} {formatRupiah(c.amount)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            Belum ada catatan mutasi kas yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginasi */}
                <div className="pt-2">
                    <DataTablePagination data={cashBooks} itemName="mutasi" filters={filters} />
                </div>
            </div>
        </MainLayout>
    );
}

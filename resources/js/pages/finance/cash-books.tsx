import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, X, Receipt, ArrowUpRight, ArrowDownRight, Scale, PiggyBank, Landmark, CircleAlert } from 'lucide-react';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';

export default function CashBooks({ cashBooks, branches, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');

    const applyFilters = (s = search, br = branchFilter) => {
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
        router.get('/cash-books', {}, { replace: true });
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
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
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

                    <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); applyFilters(search, v); }}>
                        <SelectTrigger className="w-[150px] h-9 text-sm">
                            <SelectValue placeholder="Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Cabang</SelectItem>
                            {branches?.map((b: any) => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(search || branchFilter !== 'ALL') && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
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
                {cashBooks?.total > cashBooks?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {cashBooks.from} hingga {cashBooks.to} dari {cashBooks.total} mutasi
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!cashBooks?.prev_page_url} onClick={() => router.get(cashBooks.prev_page_url)}>Sebelumnya</Button>
                            <Button variant="outline" size="sm" disabled={!cashBooks?.next_page_url} onClick={() => router.get(cashBooks.next_page_url)}>Berikutnya</Button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { Receipt, Plus, Search, X, Edit, Trash2, Calendar, Landmark, PiggyBank, ArrowDownRight, Tag, Info, Download, SlidersHorizontal, Filter } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MainLayout from '@/layouts/app/app-main-layout';
import { formatRupiah, formatDate } from '@/lib/helpers/format';
import { useExpenseStore } from './stores/useExpenseStore';
import { ExpenseFormDialog, expenseCategories } from './components/ExpenseFormDialog';

export default function Expenses({ expenses, branches, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { openForm } = useExpenseStore();

    const getCategoryBadge = (catVal: string) => {
        const cat = expenseCategories.find(c => c.value === catVal);

        return cat ? (
            <Badge variant="outline" className={`${cat.color} text-[10px] uppercase font-bold tracking-wider py-0.5`}>
                {cat.label.split(' ')[0]}
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] uppercase font-bold tracking-wider py-0.5">
                {catVal}
            </Badge>
        );
    };

    const activeFilterCount = [
        branchFilter !== 'ALL' && branchFilter !== '',
        categoryFilter !== 'ALL' && categoryFilter !== '',
        startDate !== '',
        endDate !== ''
    ].filter(Boolean).length;

    const applyFilters = (s = search, br = branchFilter, cat = categoryFilter, start = startDate, end = endDate) => {
        setIsFilterOpen(false);
        router.get('/expenses', {
            search: s || undefined,
            branch_id: (br !== 'ALL' && br !== '') ? br : undefined,
            category: (cat !== 'ALL' && cat !== '') ? cat : undefined,
            start_date: start || undefined,
            end_date: end || undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, branchFilter, categoryFilter, startDate, endDate);
        }, 350);

        return () => clearTimeout(handler);
    };

    const handleReset = () => {
        setSearch('');
        setBranchFilter('ALL');
        setCategoryFilter('ALL');
        setStartDate('');
        setEndDate('');
        setIsFilterOpen(false);
        router.get('/expenses', {}, { replace: true });
    };

    const handleExport = () => {
        if (!expenses?.data?.length) {
return;
}

        const rows = expenses.data.map((e: any) => ({
            'Tanggal': e.expense_date,
            'Kategori': e.category,
            'Deskripsi': e.title,
            'Cabang': e.branch?.name || '-',
            'Catatan': e.note || '',
            'Jumlah': e.amount,
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
        link.download = `pengeluaran_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleAdd = () => {
        openForm();
    };

    const handleEdit = (exp: any) => {
        openForm(exp);
    };

    const handleDelete = (exp: any) => {
        toast(`Apakah Anda yakin ingin menghapus catatan pengeluaran "${exp.title}"?`, {
            action: {
                label: 'Ya, Hapus',
                onClick: () => {
                    router.delete(`/expenses/${exp.id}`, {
                        onSuccess: () => toast.success('Catatan pengeluaran berhasil dihapus!'),
                        preserveScroll: true
                    });
                }
            },
            cancel: { label: 'Batal', onClick: () => {} }
        });
    };



    return (
        <MainLayout>
            <Head title="Pencatatan Pengeluaran (Expenses)" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Receipt className="h-6 w-6" /> Pengeluaran Operasional
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Catat dan pantau seluruh biaya operasional seperti gaji karyawan, listrik, air, sewa ruko, hingga kebutuhan mendadak lainnya.
                        </p>
                    </div>

                    <Button onClick={handleAdd} className="shadow-md bg-red-500 h-9 gap-1.5 shrink-0">
                        <Plus className="h-4 w-4" /> Catat Pengeluaran
                    </Button>
                </div>

                {/* Dashboard Analitik Ringkasan Finansial */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-l-4 border-l-red-500 bg-red-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Pengeluaran (Saringan)</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-red-500 animate-pulse" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-red-600">
                                {formatRupiah(stats.total)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Total pengeluaran kumulatif dari filter saat ini</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-amber-500 bg-amber-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Pengeluaran Bulan Ini</CardTitle>
                            <PiggyBank className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-amber-600">
                                {formatRupiah(stats.this_month)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Pengeluaran berjalan sejak awal bulan ini</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Alokasi Kategori Terbesar</CardTitle>
                            <Tag className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-lg font-bold text-slate-700 truncate">
                                {Object.keys(stats.by_category || {}).length ? (
                                    (() => {
                                        const entries = Object.entries(stats.by_category || {});
                                        const largest = entries.reduce((prev: any, current: any) => (prev[1] > current[1]) ? prev : current);
                                        const catName = expenseCategories.find(c => c.value === largest[0])?.label.split(' ')[0] || largest[0];

                                        return `${catName} (${formatRupiah(largest[1] as number)})`;
                                    })()
                                ) : 'Belum ada data'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">Kategori penyumbang pengeluaran terbesar</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Saringan Filter Pencarian */}
                <div className="flex gap-2 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari deskripsi pengeluaran..."
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
                        <PopoverContent className="w-[360px] p-0" align="start">
                            <div className="px-4 py-3 border-b flex items-center justify-between">
                                <p className="text-sm font-semibold">Filter Pengeluaran</p>
                                {activeFilterCount > 0 && (
                                    <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                        <X className="h-3 w-3" /> Reset
                                    </button>
                                )}
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Filter className="h-3 w-3" /> Cabang Toko
                                    </Label>
                                    <Select value={branchFilter || 'ALL'} onValueChange={(v) => setBranchFilter(v)}>
                                        <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Cabang" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Semua Cabang</SelectItem>
                                            {branches?.map((b: any) => (
                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Filter className="h-3 w-3" /> Kategori
                                    </Label>
                                    <Select value={categoryFilter || 'ALL'} onValueChange={(v) => setCategoryFilter(v)}>
                                        <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Semua Kategori</SelectItem>
                                            {expenseCategories.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label.split(' ')[0]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Rentang Tanggal
                                    </Label>
                                    <div className="flex items-center gap-1.5">
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 text-xs flex-1" />
                                        <span className="text-xs text-muted-foreground">s/d</span>
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 text-xs flex-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 py-3 border-t">
                                <Button className="w-full" size="sm" onClick={() => applyFilters()}>
                                    Terapkan Filter
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {(activeFilterCount > 0 || search) && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground gap-1.5 h-9">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}

                    <div className="flex-1" />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs shrink-0"
                        onClick={handleExport}
                        disabled={!expenses?.data?.length}
                    >
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                </div>

                {/* Tabel Daftar Pengeluaran */}
                <Card className="shadow-sm border">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Tanggal</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Deskripsi Pengeluaran</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Catatan / Keterangan</TableHead>
                                    <TableHead className="text-right w-[150px]">Jumlah (Rp)</TableHead>
                                    <TableHead className="text-right w-[110px]">Tindakan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses?.data?.length ? (
                                    expenses.data.map((e: any) => (
                                        <TableRow key={e.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-mono text-xs text-slate-600">
                                                {formatDate(e.expense_date)}
                                            </TableCell>
                                            <TableCell>{getCategoryBadge(e.category)}</TableCell>
                                            <TableCell className="font-semibold text-slate-800">{e.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {e.branch?.name || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={e.note}>
                                                {e.note || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs font-bold text-red-600">
                                                {formatRupiah(e.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TooltipProvider>
                                                    <div className="flex justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                                                    onClick={() => handleEdit(e)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit Pengeluaran</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                                    onClick={() => handleDelete(e)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Hapus Pengeluaran</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            Belum ada pengeluaran yang dicatat atau cocok dengan filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginasi */}
                <div className="pt-2">
                    <DataTablePagination data={expenses} itemName="pengeluaran" filters={filters} />
                </div>
            </div>

            <ExpenseFormDialog branches={branches} />
        </MainLayout>
    );
}

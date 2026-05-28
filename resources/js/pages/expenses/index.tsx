import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, Plus, Search, X, Edit, Trash2, Calendar, Landmark, PiggyBank, ArrowDownRight, Tag, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah, formatDate } from '@/lib/helpers/format';

export default function Expenses({ expenses, branches, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'ALL');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // State untuk form dialog
    const [isOpen, setIsOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [formData, setFormData] = useState({
        branch_id: '',
        title: '',
        amount: '',
        category: 'operasional',
        note: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    const categories = [
        { value: 'utilitas', label: 'Utilitas & Tagihan (Listrik/Air)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { value: 'sewa', label: 'Sewa Tempat / Ruko', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { value: 'gaji', label: 'Gaji Karyawan & Staff', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        { value: 'pemasaran', label: 'Pemasaran & Iklan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        { value: 'operasional', label: 'Operasional Toko', color: 'bg-teal-50 text-teal-700 border-teal-200' },
        { value: 'lainnya', label: 'Lain-lain', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    ];

    const getCategoryBadge = (catVal: string) => {
        const cat = categories.find(c => c.value === catVal);
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

    const applyFilters = (s = search, br = branchFilter, cat = categoryFilter, start = startDate, end = endDate) => {
        router.get('/expenses', {
            search: s || undefined,
            branch_id: br !== 'ALL' ? br : undefined,
            category: cat !== 'ALL' ? cat : undefined,
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
        router.get('/expenses', {}, { replace: true });
    };

    const handleAdd = () => {
        setEditingExpense(null);
        setFormData({
            branch_id: branches[0]?.id || '',
            title: '',
            amount: '',
            category: 'operasional',
            note: '',
            expense_date: new Date().toISOString().split('T')[0]
        });
        setIsOpen(true);
    };

    const handleEdit = (exp: any) => {
        setEditingExpense(exp);
        setFormData({
            branch_id: exp.branch_id,
            title: exp.title,
            amount: String(Number(exp.amount)),
            category: exp.category,
            note: exp.note || '',
            expense_date: exp.expense_date ? exp.expense_date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setIsOpen(true);
    };

    const handleDelete = (exp: any) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan pengeluaran "${exp.title}"?`)) {
            router.delete(`/expenses/${exp.id}`, {
                onSuccess: () => toast.success('Catatan pengeluaran berhasil dihapus!'),
                preserveScroll: true
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.branch_id) {
            toast.error('Harap isi semua kolom wajib!');
            return;
        }

        if (editingExpense) {
            router.put(`/expenses/${editingExpense.id}`, formData, {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Catatan pengeluaran berhasil diperbarui!');
                }
            });
        } else {
            router.post('/expenses', formData, {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Pengeluaran baru berhasil dicatat!');
                }
            });
        }
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

                    <Button onClick={handleAdd} className="shadow-md bg-primary h-9 gap-1.5 shrink-0">
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
                                        const catName = categories.find(c => c.value === largest[0])?.label.split(' ')[0] || largest[0];
                                        return `${catName} (${formatRupiah(largest[1] as number)})`;
                                    })()
                                ) : 'Belum ada data'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">Kategori penyumbang pengeluaran terbesar</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Saringan Filter Pencarian */}
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
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

                    <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); applyFilters(search, v, categoryFilter, startDate, endDate); }}>
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

                    <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); applyFilters(search, branchFilter, v, startDate, endDate); }}>
                        <SelectTrigger className="w-[150px] h-9 text-sm">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Kategori</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label.split(' ')[0]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1.5 border px-2.5 h-9 rounded-md bg-white text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); applyFilters(search, branchFilter, categoryFilter, e.target.value, endDate); }}
                            className="focus:outline-none bg-transparent"
                        />
                        <span className="text-muted-foreground">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); applyFilters(search, branchFilter, categoryFilter, startDate, e.target.value); }}
                            className="focus:outline-none bg-transparent"
                        />
                    </div>

                    {(search || branchFilter !== 'ALL' || categoryFilter !== 'ALL' || startDate || endDate) && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
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
                                                <div className="flex justify-end gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
                                                        onClick={() => handleEdit(e)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                                                        onClick={() => handleDelete(e)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
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
                {expenses?.total > expenses?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {expenses.from} hingga {expenses.to} dari {expenses.total} catatan
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!expenses?.prev_page_url} onClick={() => router.get(expenses.prev_page_url)}>Sebelumnya</Button>
                            <Button variant="outline" size="sm" disabled={!expenses?.next_page_url} onClick={() => router.get(expenses.next_page_url)}>Berikutnya</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog Form Tambah / Edit Pengeluaran */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            {editingExpense ? 'Ubah Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pastikan data pengeluaran diisi dengan benar agar pembukuan kas & laporan laba rugi terhitung akurat.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="branch_id">Cabang Toko <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.branch_id} 
                                onValueChange={(val) => setFormData({ ...formData, branch_id: val })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches?.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="category">Kategori Pengeluaran <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.category} 
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="title">Deskripsi Singkat <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                placeholder="Contoh: Bayar air PAM Mei, Pembelian ATK"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Jumlah Uang (Rp) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    placeholder="Nominal"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="expense_date">Tanggal Pengeluaran <span className="text-red-500">*</span></Label>
                                <Input
                                    id="expense_date"
                                    type="date"
                                    value={formData.expense_date}
                                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="note">Catatan / Keterangan (Opsional)</Label>
                            <Textarea
                                id="note"
                                placeholder="Tambahkan informasi pelengkap di sini..."
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                className="h-20"
                            />
                        </div>

                        <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 text-[10px] text-muted-foreground border">
                            <Info className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>
                                Pengeluaran yang dicatat di sini otomatis akan memotong saldo kas toko serta diperhitungkan di dalam laporan Laba Rugi akhir.
                            </span>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" className="bg-primary">
                                {editingExpense ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

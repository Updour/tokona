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
import { TrendingUp, Plus, Search, X, Trash2, Landmark, PiggyBank, ArrowUpRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';

export default function Incomes({ incomes, branches, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'ALL');

    // Dialog state
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        branch_id: '',
        amount: '',
        category: 'lainnya',
        note: ''
    });

    const categories = [
        { value: 'penjualan', label: 'Penjualan POS / Kasir', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { value: 'modal', label: 'Suntikan Modal Usaha', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { value: 'piutang_lunas', label: 'Pelunasan Piutang Pelanggan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        { value: 'lainnya', label: 'Pemasukan Lainnya', color: 'bg-slate-50 text-slate-700 border-slate-200' },
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

    const applyFilters = (s = search, br = branchFilter, cat = categoryFilter) => {
        router.get('/incomes', {
            search: s || undefined,
            branch_id: br !== 'ALL' ? br : undefined,
            category: cat !== 'ALL' ? cat : undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, branchFilter, categoryFilter);
        }, 350);
        return () => clearTimeout(handler);
    };

    const handleReset = () => {
        setSearch('');
        setBranchFilter('ALL');
        setCategoryFilter('ALL');
        router.get('/incomes', {}, { replace: true });
    };

    const handleAdd = () => {
        setFormData({
            branch_id: branches[0]?.id || '',
            amount: '',
            category: 'lainnya',
            note: ''
        });
        setIsOpen(true);
    };

    const handleDelete = (inc: any) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan pemasukan "${inc.note}"?`)) {
            router.delete(`/cash-books/${inc.id}`, {
                onSuccess: () => toast.success('Catatan pemasukan berhasil dihapus!'),
                preserveScroll: true
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.note || !formData.branch_id) {
            toast.error('Harap isi semua kolom wajib!');
            return;
        }

        router.post('/incomes', formData, {
            onSuccess: () => {
                setIsOpen(false);
                toast.success('Pemasukan baru berhasil dicatat!');
            }
        });
    };

    return (
        <MainLayout>
            <Head title="Pencatatan Pemasukan Kas (Cash In)" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-emerald-600" /> Penerimaan Pemasukan Kas
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau seluruh aliran kas masuk Anda. Selain penjualan otomatis dari mesin kasir, Anda juga bisa mencatat setoran modal usaha.
                        </p>
                    </div>

                    <Button onClick={handleAdd} className="shadow-md bg-emerald-600 hover:bg-emerald-700 h-9 gap-1.5 shrink-0">
                        <Plus className="h-4 w-4" /> Catat Pemasukan
                    </Button>
                </div>

                {/* Dashboard Analitik Ringkasan Finansial */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-emerald-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Pemasukan (Filter)</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-500 animate-bounce" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-extrabold text-emerald-600">
                                {formatRupiah(stats.total)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Total seluruh uang masuk tunai & bank</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-blue-500 bg-blue-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Pemasukan Bulan Ini</CardTitle>
                            <PiggyBank className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-extrabold text-blue-600">
                                {formatRupiah(stats.this_month)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Uang kas masuk berjalan bulan ini</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Saringan Filter Pencarian */}
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari keterangan pemasukan..."
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

                    <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); applyFilters(search, v, categoryFilter); }}>
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

                    <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); applyFilters(search, branchFilter, v); }}>
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

                    {(search || branchFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {/* Tabel Daftar Pemasukan */}
                <Card className="shadow-sm border">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[150px]">Tanggal / Waktu</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Keterangan Pemasukan</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead className="text-right w-[180px]">Nominal (Rp)</TableHead>
                                    <TableHead className="text-right w-[80px]">Hapus</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incomes?.data?.length ? (
                                    incomes.data.map((i: any) => (
                                        <TableRow key={i.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-mono text-xs text-slate-600">
                                                {formatDateTime(i.created_at)}
                                            </TableCell>
                                            <TableCell>{getCategoryBadge(i.category)}</TableCell>
                                            <TableCell className="font-semibold text-slate-800">{i.note}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {i.branch?.name || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                                                + {formatRupiah(i.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {i.category !== 'penjualan' ? (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                                                        onClick={() => handleDelete(i)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground italic font-mono pr-2">System</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            Belum ada kas masuk yang dicatat atau cocok dengan filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginasi */}
                {incomes?.total > incomes?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {incomes.from} hingga {incomes.to} dari {incomes.total} catatan
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!incomes?.prev_page_url} onClick={() => router.get(incomes.prev_page_url)}>Sebelumnya</Button>
                            <Button variant="outline" size="sm" disabled={!incomes?.next_page_url} onClick={() => router.get(incomes.next_page_url)}>Berikutnya</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog Form Tambah Pemasukan */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-emerald-600" /> Catat Pemasukan Manual
                        </DialogTitle>
                        <DialogDescription>
                            Gunakan ini untuk mencatat kas masuk non-penjualan seperti suntikan modal pemegang saham atau pelunasan hutang pihak ketiga.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="branch_id">Cabang Penerima <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="category">Kategori Pemasukan <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.category} 
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.filter(c => c.value !== 'penjualan').map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="amount">Jumlah Uang Masuk (Rp) <span className="text-red-500">*</span></Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                placeholder="Nominal Rp"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="note">Keterangan / Sumber Dana <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="note"
                                placeholder="Contoh: Suntikan Modal Owner untuk beli kulkas baru"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                className="h-20"
                            />
                        </div>

                        <div className="flex gap-2 p-2.5 rounded-lg bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-100">
                            <Info className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                                Setoran kas masuk manual ini otomatis akan menambah total saldo rekening dan kas cabang toko yang dipilih.
                            </span>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Simpan Pemasukan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

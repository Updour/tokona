import { Head, router } from '@inertiajs/react';
import { DollarSign, Percent, TrendingUp, Search, X, Edit, Check, Play, Sliders, Calculator, ShieldCheck, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Pricing({ products, categories, branches, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || 'ALL');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'ALL');

    // State untuk edit baris cepat
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({
        base_cost: 0,
        sell_price: 0,
        min_sell_price: 0
    });

    // State untuk bulk markup dialog
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [bulkCategory, setBulkCategory] = useState('ALL');
    const [bulkBranch, setBulkBranch] = useState('ALL');
    const [bulkType, setBulkType] = useState('percentage');
    const [bulkValue, setBulkValue] = useState(0);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const applyFilters = (s = search, cat = categoryFilter, br = branchFilter) => {
        router.get('/products/pricing', {
            search: s || undefined,
            category_id: cat !== 'ALL' ? cat : undefined,
            branch_id: br !== 'ALL' ? br : undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, categoryFilter, branchFilter);
        }, 350);

        return () => clearTimeout(handler);
    };

    const startEditing = (p: any) => {
        setEditingId(p.id);
        setEditData({
            base_cost: Number(p.base_cost) || 0,
            sell_price: Number(p.sell_price) || 0,
            min_sell_price: Number(p.min_sell_price) || 0
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveRow = (p: any) => {
        if (editData.min_sell_price > editData.sell_price) {
            toast.error('Harga minimum tidak boleh melebihi harga jual!');

            return;
        }

        router.put(`/products/${p.id}`, {
            name: p.name,
            sku: p.sku || '',
            barcode: p.barcode || '',
            description: p.description || '',
            category_id: p.category_id || '',
            type_id: p.type_id || '',
            supplier_id: p.supplier_id || '',
            branch_id: p.branch_id,
            track_stock: p.track_stock === 1 || p.track_stock === true,
            allow_negative_stock: p.allow_negative_stock === 1 || p.allow_negative_stock === true,
            is_active: p.is_active === 1 || p.is_active === true,
            base_cost: editData.base_cost,
            sell_price: editData.sell_price,
            min_sell_price: editData.min_sell_price
        }, {
            onSuccess: () => {
                setEditingId(null);
                toast.success('Harga produk berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui harga produk.');
            }
        });
    };

    const handleBulkMarkup = (e: React.FormEvent) => {
        e.preventDefault();

        if (bulkValue <= 0) {
            toast.error('Nilai markup harus lebih besar dari 0!');

            return;
        }

        setBulkProcessing(true);

        router.post('/products/bulk-markup', {
            category_id: bulkCategory !== 'ALL' ? bulkCategory : undefined,
            branch_id: bulkBranch !== 'ALL' ? bulkBranch : undefined,
            markup_type: bulkType,
            markup_value: bulkValue
        }, {
            onSuccess: () => {
                setIsBulkOpen(false);
                setBulkProcessing(false);
                toast.success('Harga jual produk berhasil dinaikkan secara massal!');
            },
            onError: () => {
                setBulkProcessing(false);
                toast.error('Terjadi kesalahan saat menaikkan harga massal.');
            }
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategoryFilter('ALL');
        setBranchFilter('ALL');
        router.get('/products/pricing', {}, { replace: true });
    };

    // Kalkulasi Dashboard secara lokal dari data produk yang dimuat
    const productsData = products?.data || [];
    const totalPotentialProfit = productsData.reduce((acc: number, cur: any) => {
        const cost = Number(cur.base_cost) || 0;
        const sell = Number(cur.sell_price) || 0;
        const stock = Number(cur.current_stock) || 0;

        return acc + (stock > 0 ? stock * (sell - cost) : 0);
    }, 0);

    const totalInventoryValue = productsData.reduce((acc: number, cur: any) => {
        const cost = Number(cur.base_cost) || 0;
        const stock = Number(cur.current_stock) || 0;

        return acc + (stock > 0 ? stock * cost : 0);
    }, 0);

    const avgMargin = productsData.length
        ? productsData.reduce((acc: number, cur: any) => {
            const cost = Number(cur.base_cost) || 0;
            const sell = Number(cur.sell_price) || 0;

            if (sell === 0) {
return acc;
}

            return acc + (((sell - cost) / sell) * 100);
        }, 0) / productsData.length
        : 0;

    return (
        <MainLayout>
            <Head title="Manajemen Harga & Margin Keuntungan" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <TrendingUp className="h-6 w-6" /> Harga & Margin Keuntungan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau kesehatan margin kotor produk Anda, sesuaikan harga jual/HPP, dan lakukan markup massal instan.
                        </p>
                    </div>

                    <Button onClick={() => setIsBulkOpen(true)} className="shadow-md bg-primary  h-9 gap-1.5 shrink-0">
                        <Calculator className="h-4 w-4" /> Kalkulator Markup Massal
                    </Button>
                </div>

                {/* Dashboard Analitik Profitabilitas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-l-4 border-l-primary bg-primary/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Rata-rata Margin Kotor</CardTitle>
                            <Percent className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className={`text-2xl font-extrabold ${avgMargin < 15 ? 'text-red-600' : avgMargin < 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {avgMargin.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {avgMargin < 15 ? 'Margin tipis. Perlu optimasi harga.' : avgMargin < 30 ? 'Margin sehat dan stabil.' : 'Margin sangat tebal!'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-emerald-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Potensi Laba Kotor (Stok)</CardTitle>
                            <Tag className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-emerald-600">
                                Rp {totalPotentialProfit.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Estimasi profit dari stok berjalan</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Nilai Modal Aset (HPP)</CardTitle>
                            <Sliders className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-indigo-600">
                                Rp {totalInventoryValue.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Total nilai aset modal di toko</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Saringan Filter */}
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama produk atau SKU..."
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

                    <Select value={categoryFilter} onValueChange={(v) => {
 setCategoryFilter(v); applyFilters(search, v, branchFilter); 
}}>
                        <SelectTrigger className="w-[150px] h-9 text-sm">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Kategori</SelectItem>
                            {categories?.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={branchFilter} onValueChange={(v) => {
 setBranchFilter(v); applyFilters(search, categoryFilter, v); 
}}>
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

                    {(search || categoryFilter !== 'ALL' || branchFilter !== 'ALL') && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {/* Tabel Kontrol Harga */}
                <Card className="shadow-sm border">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">Nama Produk</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead className="w-[140px]">Harga Modal (HPP)</TableHead>
                                    <TableHead className="w-[140px]">Harga Jual (Rp)</TableHead>
                                    <TableHead>Margin Kotor</TableHead>
                                    <TableHead className="w-[140px]">Harga Jual Min</TableHead>
                                    <TableHead className="text-right w-[110px]">Aksi Cepat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.data?.length ? (
                                    products.data.map((p: any) => {
                                        const isEditing = editingId === p.id;

                                        // Kalkulasi Margin Keuntungan
                                        const cost = isEditing ? editData.base_cost : Number(p.base_cost);
                                        const sell = isEditing ? editData.sell_price : Number(p.sell_price);
                                        const profit = sell - cost;
                                        const marginPct = sell > 0 ? (profit / sell) * 100 : 0;

                                        // Indikator Warna Margin
                                        const marginBadgeStyles =
                                            marginPct < 15 ? 'bg-red-50 text-red-700 border-red-200' :
                                                marginPct < 30 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-200';

                                        return (
                                            <TableRow key={p.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-semibold text-slate-800">
                                                    <div>{p.name}</div>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{p.category?.name || 'Umum'}</span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-slate-600">{p.sku || '-'}</TableCell>
                                                <TableCell className="font-mono text-xs text-slate-600 font-bold">{p.current_stock || 0}</TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            value={editData.base_cost}
                                                            onChange={(e) => setEditData({ ...editData, base_cost: parseFloat(e.target.value) || 0 })}
                                                            className="h-8 text-xs font-mono w-full"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-xs">Rp {Number(p.base_cost).toLocaleString('id-ID')}</span>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            value={editData.sell_price}
                                                            onChange={(e) => setEditData({ ...editData, sell_price: parseFloat(e.target.value) || 0 })}
                                                            className="h-8 text-xs font-mono w-full"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-xs font-bold text-slate-800">Rp {Number(p.sell_price).toLocaleString('id-ID')}</span>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold border ${marginBadgeStyles}`}>
                                                        {marginPct.toFixed(0)}%
                                                    </span>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">Profit Rp {profit.toLocaleString('id-ID')}</div>
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            value={editData.min_sell_price}
                                                            onChange={(e) => setEditData({ ...editData, min_sell_price: parseFloat(e.target.value) || 0 })}
                                                            className="h-8 text-xs font-mono w-full"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-xs text-muted-foreground">Rp {Number(p.min_sell_price || p.sell_price).toLocaleString('id-ID')}</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-700"
                                                                onClick={() => saveRow(p)}
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 w-7 p-0"
                                                                onClick={cancelEditing}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 gap-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                            onClick={() => startEditing(p)}
                                                        >
                                                            <Edit className="h-3 w-3" /> Edit Harga
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            Tidak ditemukan produk yang cocok dengan pencarian.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginasi */}
                {products?.total > products?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {products.from} hingga {products.to} dari {products.total} produk
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!products?.prev_page_url} onClick={() => router.get(products.prev_page_url)}>Sebelumnya</Button>
                            <Button variant="outline" size="sm" disabled={!products?.next_page_url} onClick={() => router.get(products.next_page_url)}>Berikutnya</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog Markup Massal */}
            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-indigo-600 animate-pulse" /> Markup Harga Jual Massal
                        </DialogTitle>
                        <DialogDescription>
                            Tingkatkan harga jual beberapa produk sekaligus untuk menyesuaikan dengan kenaikan modal bahan baku.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBulkMarkup} className="space-y-4 py-2">

                        <div className="space-y-1.5">
                            <Label>Filter Kategori Produk</Label>
                            <Select value={bulkCategory} onValueChange={setBulkCategory}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Kategori</SelectItem>
                                    {categories?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Filter Cabang Toko</Label>
                            <Select value={bulkBranch} onValueChange={setBulkBranch}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Cabang</SelectItem>
                                    {branches?.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-lg border">
                            <div className="space-y-1.5">
                                <Label>Tipe Kenaikan</Label>
                                <Select value={bulkType} onValueChange={setBulkType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Persen (%)</SelectItem>
                                        <SelectItem value="fixed">Rupiah (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Nilai Kenaikan</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={bulkValue}
                                    onChange={(e) => setBulkValue(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 p-3 rounded-lg bg-indigo-50/50 text-[11px] text-indigo-700 border border-indigo-100">
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <span>
                                Sistem secara otomatis akan memastikan batas <strong>Harga Jual Minimum</strong> tetap proporsional dan tidak melebihi harga jual baru.
                            </span>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={bulkProcessing} className="bg-primary">
                                {bulkProcessing ? 'Memproses...' : 'Terapkan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

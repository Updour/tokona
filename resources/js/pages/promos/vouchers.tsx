import { formatRupiah } from '@/lib/helpers/format';
import { Head, router } from '@inertiajs/react';
import { Megaphone, Plus, Search, X, Copy, Ticket, Check, Scissors, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromoFormDialog } from '@/features/promos/components/PromoFormDialog';
import { usePromoStore } from '@/pages/promos/stores/usePromoStore';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Vouchers({ vouchers, stats, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'ALL');
    
    // Copy state tracker
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { openForm } = usePromoStore();

    const applyFilters = (s = search, status = statusFilter) => {
        router.get('/vouchers', {
            search: s || undefined,
            status: status !== 'ALL' ? status : undefined
        }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        const handler = setTimeout(() => {
            applyFilters(val, statusFilter);
        }, 350);

        return () => clearTimeout(handler);
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        applyFilters(search, val);
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('ALL');
        router.get('/vouchers', {}, { replace: true });
    };

    const handleAdd = () => {
        openForm();
    };

    const handleEdit = (promo: any) => {
        openForm(promo);
    };

    const handleCopy = (id: string, code: string) => {
        // Hapus spasi dan jadikan huruf kapital untuk format kode kupon standar
        const cleanCode = code.replace(/\s+/g, '').toUpperCase();
        navigator.clipboard.writeText(cleanCode);
        setCopiedId(id);
        toast.success(`Kode kupon "${cleanCode}" disalin ke clipboard!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleStatus = (promo: any) => {
        router.put(`/promos/${promo.id}`, {
            name: promo.name,
            type: promo.type,
            value: promo.value,
            scope: promo.scope || 'global',
            target_id: promo.target_id || '',
            min_qty: promo.min_qty || 0,
            min_amount: promo.min_amount || 0,
            start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
            end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
            is_active: !promo.is_active
        }, {
            onSuccess: () => toast.success(`Voucher berhasil ${!promo.is_active ? 'diaktifkan' : 'dinonaktifkan'}!`),
            preserveScroll: true
        });
    };

    return (
        <MainLayout>
            <Head title="Voucher Pelanggan" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Ticket className="h-6 w-6 text-primary animate-bounce" /> Voucher & Kupon Pelanggan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Buat kode promo unik yang bisa dibagikan dan dimasukkan oleh Kasir saat transaksi berlangsung.
                        </p>
                    </div>

                    <Button onClick={handleAdd} className="shadow-md bg-orange-600 hover:bg-orange-700 h-9 gap-1.5 shrink-0">
                        <Plus className="h-4 w-4" /> Buat Kupon Baru
                    </Button>
                </div>

                {/* Ringkasan Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-sm border-l-4 border-l-orange-500">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold uppercase">Total Kupon</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{stats.total || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-emerald-500">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold uppercase">Kupon Aktif</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-emerald-600">{stats.active || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-slate-400">
                        <CardHeader className="p-4 pb-2">
                            <CardDescription className="text-xs font-semibold uppercase">Kupon Non-Aktif</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Saringan */}
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded-lg border shadow-sm">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kupon..."
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

                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Non-Aktif</SelectItem>
                        </SelectContent>
                    </Select>

                    {(search || statusFilter !== 'ALL') && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {/* Tampilan Grid Kupon Robek Premium (WOW) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vouchers?.data?.length ? (
                        vouchers.data.map((v: any) => {
                            const cleanCode = v.name.replace(/\s+/g, '').toUpperCase();
                            const isPercentage = v.type === 'percentage';
                            const formattedValue = isPercentage ? `${Number(v.value)}%` : `${formatRupiah(v.value)}`;

                            return (
                                <div 
                                    key={v.id} 
                                    className={`relative overflow-hidden rounded-xl border bg-white shadow-sm flex flex-col transition-all duration-300 hover:shadow-md ${
                                        v.is_active ? 'border-orange-200' : 'border-slate-200 opacity-75'
                                    }`}
                                >
                                    {/* Lingkaran notch tiket robek (kiri dan kanan) */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-55 rounded-r-full border-r border-y border-solid border-slate-200 -ml-[1px]" style={{ backgroundColor: '#f8fafc' }} />
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-55 rounded-l-full border-l border-y border-solid border-slate-200 -mr-[1px]" style={{ backgroundColor: '#f8fafc' }} />

                                    {/* Bagian Atas Kupon */}
                                    <div className={`p-5 flex-1 flex flex-col justify-between border-b border-dashed border-slate-200 pb-6 relative`}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <Badge variant={v.is_active ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                                                    {v.is_active ? 'READY USE' : 'EXPIRED'}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {v.min_amount > 0 ? `Min. Belanja ${formatRupiah(v.min_amount)}` : 'Tanpa Min. Belanja'}
                                                </p>
                                            </div>
                                            <div className={`p-2 rounded-lg ${v.is_active ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="my-6">
                                            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800">
                                                {formattedValue} <span className="text-sm font-semibold text-slate-500">OFF</span>
                                            </h3>
                                            <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-1">{v.name}</p>
                                        </div>

                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Scissors className="h-3 w-3" />
                                            <span>Masa berlaku: {v.start_date ? new Date(v.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'Seterusnya'}</span>
                                            {v.end_date && <span> - {new Date(v.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                                        </div>
                                    </div>

                                    {/* Bagian Bawah Kupon (Kode & Aksi) */}
                                    <div className="px-5 py-4 bg-slate-50/70 flex items-center justify-between gap-3">
                                        <div className="font-mono text-xs font-bold tracking-wider bg-white border px-2.5 py-1 rounded text-slate-700 truncate max-w-[140px]">
                                            {cleanCode}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleCopy(v.id, cleanCode)}
                                                title="Salin Kode Kupon"
                                            >
                                                {copiedId === v.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-600" />}
                                            </Button>

                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className={`h-8 text-xs font-semibold px-2 ${
                                                    v.is_active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                                }`}
                                                onClick={() => toggleStatus(v)}
                                            >
                                                {v.is_active ? 'Matikan' : 'Aktifkan'}
                                            </Button>

                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                className="h-8 text-xs font-semibold px-2"
                                                onClick={() => handleEdit(v)}
                                            >
                                                Ubah
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border rounded-xl shadow-sm">
                            <AlertCircle className="h-10 w-10 text-muted-foreground animate-pulse mb-3" />
                            <p className="font-semibold text-slate-800">Tidak ada voucher kupon</p>
                            <p className="text-sm text-muted-foreground mt-1">Coba sesuaikan pencarian Anda atau buat kupon voucher baru.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {vouchers?.total > vouchers?.per_page && (
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {vouchers.from} hingga {vouchers.to} dari {vouchers.total} kupon voucher
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!vouchers?.prev_page_url} onClick={() => router.get(vouchers.prev_page_url)}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={!vouchers?.next_page_url} onClick={() => router.get(vouchers.next_page_url)}>Next</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Dialog Vouchers (Reused Promo Dialog) */}
            <PromoFormDialog />
        </MainLayout>
    );
}

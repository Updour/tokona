import { formatNumber , formatRupiah, formatDate } from '@/lib/helpers/format';
import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Head, router } from '@inertiajs/react';
import { 
    Search, Users, Calculator, CheckCircle, Clock, X, SlidersHorizontal, Building2, Plus, Trash2, LayoutGrid, List, Layers
} from 'lucide-react';
import PayrollsTable from '@/pages/hris/payrolls/components/PayrollsTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import GeneratePayrollDialog from './components/GeneratePayrollDialog';
import BulkGenerateDialog from './components/BulkGenerateDialog';
import ConfirmPayDialog from './components/ConfirmPayDialog';
import { usePayrollStore } from './stores/usePayrollStore';

export default function PayrollsIndex({ payrolls, employees, filters, branches, tenants, is_super_admin }: any) {
    const { openGenerate, openConfirmPay, openBulkGenerate } = usePayrollStore();
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters.branch_id || '',
        tenant_id: filters.tenant_id || '',
    });
    
    // View Mode State (Persist in localStorage if possible, default to table)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    
    const activeFilterCount = [
        localFilters.branch_id,
        localFilters.tenant_id,
    ].filter(Boolean).length;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 350);
        return () => clearTimeout(handler);
    }, [search]);

    const applyFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            search: search || undefined,
            branch_id: localFilters.branch_id || undefined,
            tenant_id: localFilters.tenant_id || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/hris/payrolls', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ branch_id: '', tenant_id: '' });
        router.get('/hris/payrolls', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };



    return (
        <MainLayout>
            <Head title="Penggajian Karyawan" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Penggajian (Payroll)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola slip gaji, tunjangan, potongan, dan riwayat pembayaran karyawan.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={openBulkGenerate}>
                        <Layers className="h-4 w-4" /> Generate Masal
                    </Button>
                    <Button className="gap-2" onClick={openGenerate}>
                        <Calculator className="h-4 w-4" /> Generate Gaji
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full flex flex-col gap-4">
                
                {/* Filter Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama karyawan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-9"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 h-9">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <p className="text-sm font-semibold">Filter Penggajian</p>
                                    {activeFilterCount > 0 && (
                                        <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                            <X className="h-3 w-3" /> Reset
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 space-y-4">
                                    {is_super_admin && tenants && tenants.length > 0 && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                                <Building2 className="h-3 w-3" /> Tenant
                                            </Label>
                                            <Select value={localFilters.tenant_id || '__all__'} onValueChange={(v) => updateLocal('tenant_id', v === '__all__' ? '' : v)}>
                                                <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua tenant" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__all__">Semua tenant</SelectItem>
                                                    {tenants.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3" /> Cabang
                                        </Label>
                                        <Select value={localFilters.branch_id || '__all__'} onValueChange={(v) => updateLocal('branch_id', v === '__all__' ? '' : v)}>
                                            <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua cabang" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">Semua cabang</SelectItem>
                                                {branches?.map((b: any) => (
                                                    <SelectItem key={b.id} value={b.id}>
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
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

                        {(activeFilterCount > 0 || search) && (
                            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9">
                                <X className="h-3.5 w-3.5" /> Reset
                            </Button>
                        )}

                        <div className="flex-1" />

                        <span className="text-sm text-muted-foreground hidden sm:block mr-2">
                            {formatNumber(payrolls.total)} slip gaji
                        </span>
                        
                        <div className="flex bg-muted rounded-md border p-0.5">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Tampilan Tabel"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Tampilan Grid"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {localFilters.branch_id && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                                    Cabang: {branches?.find((b: any) => b.id === localFilters.branch_id)?.name ?? '...'}
                                    <button onClick={() => { updateLocal('branch_id', ''); applyFilters({ branch_id: undefined }); }} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {localFilters.tenant_id && tenants && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                                    Tenant: {tenants?.find((t: any) => t.id === localFilters.tenant_id)?.name ?? '...'}
                                    <button onClick={() => { updateLocal('tenant_id', ''); applyFilters({ tenant_id: undefined }); }} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Cards Grid */}
                {viewMode === 'table' ? (
                    <PayrollsTable 
                        payrolls={payrolls.data} 
                        formatDate={formatDate}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {payrolls.data.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                                Belum ada slip gaji yang tercatat untuk filter ini.
                            </div>
                        ) : (
                            payrolls.data.map((payroll: any) => (
                                <div key={payroll.id} className="group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                                    {payroll.user?.avatar ? (
                                                        <img src={`/storage/${payroll.user.avatar}`} alt={payroll.user?.name || 'User'} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="font-semibold text-muted-foreground">
                                                            {payroll.user?.name?.charAt(0) || '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-card-foreground line-clamp-1">{payroll.user?.name || 'Karyawan Tidak Diketahui'}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {payroll.user?.nip && (
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border">
                                                                {payroll.user.nip}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {payroll.user?.position || 'Staf'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Periode: {formatDate(payroll.period_start)}
                                                    </p>
                                                </div>
                                            </div>
                                            {payroll.status === 'paid' ? (
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Lunas
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
                                                    <Clock className="h-3 w-3" /> Draft
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-1.5 mt-5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Gaji Pokok</span>
                                                <span className="font-medium text-foreground">{formatRupiah(payroll.basic_salary)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-emerald-600 dark:text-emerald-500">Tunjangan (+)</span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-500">{formatRupiah(payroll.total_allowance)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-destructive">Potongan (-)</span>
                                                <span className="font-medium text-destructive">{formatRupiah(payroll.total_deduction)}</span>
                                            </div>
                                            
                                            <div className="pt-3 mt-3 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-foreground text-sm">Total Diterima</span>
                                                    <span className="font-bold text-lg text-primary">
                                                        {formatRupiah(payroll.net_salary)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 flex gap-2">
                                        <Button variant="outline" className="flex-1 h-9" onClick={() => window.open(`/hris/payrolls/${payroll.id}/print`, '_blank')}>
                                            Cetak Slip
                                        </Button>
                                        {payroll.status === 'draft' && (
                                            <Button 
                                                onClick={() => openConfirmPay(payroll.id)}
                                                className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                Bayar Gaji
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                
                {/* Pagination */}
                {payrolls.data.length > 0 && (
                    <div className="flex items-center justify-between py-2 mt-2">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{payrolls.from}</span> - <span className="font-medium text-foreground">{payrolls.to}</span> dari <span className="font-medium text-foreground">{payrolls.total}</span> data
                        </div>
                        <div className="flex gap-1">
                            {payrolls.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`inline-flex items-center justify-center rounded-md h-8 min-w-8 px-3 text-xs font-medium transition-colors border
                                        ${link.active 
                                            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                                            : 'bg-background hover:bg-muted'}
                                        ${!link.url ? 'opacity-50 cursor-not-allowed border-transparent' : ''}
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <GeneratePayrollDialog employees={employees} />
            <BulkGenerateDialog />
            <ConfirmPayDialog />
        </MainLayout>
    );
}

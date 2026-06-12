import { formatNumber , formatRupiah } from '@/lib/helpers/format';
import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Head, router } from '@inertiajs/react';
import { 
    Search, BookOpen, Download, Building2, X, SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useJournalStore } from './stores/useJournalStore';
import JournalFormDialog from './components/JournalFormDialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function JournalsIndex({ journals, accounts, filters, branches, tenants, is_super_admin }: any) {
    const { openForm } = useJournalStore();
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters.branch_id || '',
        tenant_id: filters.tenant_id || '',
    });

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
        router.get('/finance/accounting/journals', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ branch_id: '', tenant_id: '' });
        router.get('/finance/accounting/journals', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    
    const formatDateHelper = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <MainLayout>
            <Head title="Jurnal Umum" />
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Jurnal Umum
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Laporan pencatatan ganda (double-entry) untuk semua transaksi bisnis.
                    </p>
                </div>
                <Button onClick={openForm} className="gap-2 shrink-0">
                    <BookOpen className="h-4 w-4" /> Tambah Jurnal Manual
                </Button>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full flex flex-col gap-4">
                
                {/* Filter Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari referensi atau deskripsi..."
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
                                    <p className="text-sm font-semibold">Filter Jurnal</p>
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
                            {formatNumber(journals.total)} data
                        </span>

                        <Button variant="outline" size="sm" className="gap-1.5 h-9">
                            <Download className="h-4 w-4" /> Export
                        </Button>
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

                {/* Table Area */}
                <div className="rounded-md border overflow-hidden mt-2">
                    <div className="overflow-x-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Tanggal</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Referensi</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Akun & Deskripsi</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground w-[150px]">Debit</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground w-[150px]">Kredit</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0 bg-card">
                                {journals.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Tidak ada jurnal yang cocok dengan filter yang dipilih.
                                        </td>
                                    </tr>
                                ) : (
                                    journals.data.map((journal: any) => (
                                        <React.Fragment key={journal.id}>
                                            <tr className="border-b bg-muted/20">
                                                <td className="p-3 align-top font-medium">
                                                    {formatDateHelper(journal.date)}
                                                </td>
                                                <td className="p-3 align-top">
                                                    <div className="font-medium text-primary">{journal.reference_number}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{journal.source_type}</div>
                                                </td>
                                                <td className="p-3 align-top font-medium" colSpan={3}>
                                                    {journal.description}
                                                    {journal.branch && (
                                                        <Badge variant="outline" className="ml-2 font-normal text-[10px]">
                                                            {journal.branch.name}
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                            {journal.entries.map((entry: any, index: number) => (
                                                <tr key={entry.id} className={`border-b border-border/40 ${index === journal.entries.length - 1 ? 'border-b-2 border-b-border' : ''}`}>
                                                    <td className="p-2"></td>
                                                    <td className="p-2"></td>
                                                    <td className="p-2 align-middle text-sm">
                                                        <div className={`flex items-center gap-2 ${entry.credit > 0 ? 'ml-8 text-muted-foreground' : 'font-medium'}`}>
                                                            <span className="text-muted-foreground">({entry.account?.code})</span>
                                                            <span>{entry.account?.name}</span>
                                                        </div>
                                                        {entry.description && (
                                                            <div className="text-xs text-muted-foreground mt-1 ml-10">
                                                                {entry.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2 text-right align-middle font-mono text-sm text-foreground/80">
                                                        {entry.debit > 0 ? formatRupiah(entry.debit) : '-'}
                                                    </td>
                                                    <td className="p-2 text-right align-middle font-mono text-sm text-foreground/80">
                                                        {entry.credit > 0 ? formatRupiah(entry.credit) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {journals.data.length > 0 && (
                    <div className="flex items-center justify-between py-2">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{journals.from}</span> - <span className="font-medium text-foreground">{journals.to}</span> dari <span className="font-medium text-foreground">{journals.total}</span> data
                        </div>
                        <div className="flex gap-1">
                            {journals.links.map((link: any, i: number) => (
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
            <JournalFormDialog accounts={accounts} branches={branches} isSuperAdmin={is_super_admin} />
        </MainLayout>
    );
}

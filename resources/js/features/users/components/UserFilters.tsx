import { router } from '@inertiajs/react';
import { Search, Plus, Download, SlidersHorizontal, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface UserFiltersProps {
    filters: Record<string, any>;
    branches: any[];
    tenants?: any[];
    totalResults: number;
    onAddClick: () => void;
    onExport: () => void;
}

export function UserFilters({
    filters,
    branches,
    tenants = [],
    totalResults,
    onAddClick,
    onExport,
}: UserFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters.branch_id || '',
        tenant_id: filters.tenant_id || '',
        status: filters.status || '',
        sort: filters.sort || 'created_at',
        direction: filters.direction || 'desc',
    });

    const activeFilterCount = [
        localFilters.branch_id,
        localFilters.tenant_id,
        localFilters.status,
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
            status: localFilters.status || undefined,
            sort: localFilters.sort,
            direction: localFilters.direction,
            ...overrides,
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === 'ALL') {
                delete params[key];
            }
        });

        router.get(window.location.pathname, params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setLocalFilters({ branch_id: '', tenant_id: '', status: '', sort: 'created_at', direction: 'desc' });
        setSearch('');
        router.get(window.location.pathname, {}, { preserveState: true, replace: true });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2 w-full sm:max-w-md">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama, email, atau telepon..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-background border-slate-200"
                    />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-200 shrink-0">
                            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-[10px] rounded-full bg-indigo-100 text-indigo-700">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-500" /> Filter Karyawan
                            </h4>
                            {activeFilterCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-muted-foreground hover:text-red-600">
                                    Reset
                                </Button>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            {tenants.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground">Toko / Tenant</Label>
                                    <Select value={localFilters.tenant_id} onValueChange={v => setLocalFilters({ ...localFilters, tenant_id: v })}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Semua Toko" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Semua Toko</SelectItem>
                                            {tenants.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Cabang Penugasan</Label>
                                <Select value={localFilters.branch_id} onValueChange={v => setLocalFilters({ ...localFilters, branch_id: v })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Semua Cabang" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Semua Cabang</SelectItem>
                                        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                                <Select value={localFilters.status} onValueChange={v => setLocalFilters({ ...localFilters, status: v })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Urutkan</Label>
                                <Select value={`${localFilters.sort}-${localFilters.direction}`} onValueChange={(v) => {
                                    const [sort, direction] = v.split('-');
                                    setLocalFilters({ ...localFilters, sort, direction });
                                }}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Urutan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at-desc">Tanggal Daftar (Terbaru)</SelectItem>
                                        <SelectItem value="created_at-asc">Tanggal Daftar (Terlama)</SelectItem>
                                        <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Separator />
                        <div className="p-3 bg-slate-50 flex flex-col gap-2">
                            <span className="text-xs text-muted-foreground text-center">{totalResults} karyawan ditemukan</span>
                            <Button size="sm" className="w-full" onClick={() => applyFilters()}>Terapkan Filter</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onExport} disabled={totalResults === 0} className="hidden sm:flex border-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button onClick={onAddClick} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
                </Button>
            </div>
        </div>
    );
}

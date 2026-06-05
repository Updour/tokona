import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, Building2, Coins } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SalesFiltersProps {
    branches: any[];
    filters?: any;
    totalSales: number;
}

export function SalesFilters({ branches = [], filters = {}, totalSales }: SalesFiltersProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters?.branch_id || '',
        is_active: filters?.is_active ?? '',
        commission_type: filters?.commission_type || '',
    });

    const activeFilterCount = [
        localFilters.branch_id,
        localFilters.is_active !== '',
        localFilters.commission_type,
    ].filter(Boolean).length;

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                applyFilters({ search });
            }
        }, 350);

        return () => clearTimeout(handler);
    }, [search]);

    const applyFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            search: search || undefined,
            branch_id: localFilters.branch_id || undefined,
            is_active: localFilters.is_active !== '' ? localFilters.is_active : undefined,
            commission_type: localFilters.commission_type || undefined,
            ...overrides,
        };

        Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
        router.get('/sales', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({
            branch_id: '',
            is_active: '',
            commission_type: '',
        });
        router.get('/sales', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-3.5 shrink-0">
            {/* SEARCH AND FILTERS BAR */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama, email, telepon..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 text-xs font-semibold h-9 shadow-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 h-9 text-xs font-bold border-slate-200 shadow-sm">
                            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-indigo-650 text-white border-0 font-extrabold">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0 shadow-xl border-slate-100 rounded-xl" align="start">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-black text-slate-800">Filter Sales</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-[10px] font-bold text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset semua
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Filter cabang */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3 text-primary-500" /> Cabang Tugas
                                </Label>
                                <Select value={localFilters.branch_id || '__all__'} onValueChange={(v) => updateLocal('branch_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold w-full bg-white border-slate-200 w-full"><SelectValue placeholder="Semua cabang" /></SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        <SelectItem value="__all__" className="text-xs">Semua cabang</SelectItem>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id} className="text-xs font-semibold">
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Tipe Komisi */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <Coins className="h-3 w-3 text-primary-500" /> Tipe Komisi
                                </Label>
                                <Select value={localFilters.commission_type || '__all__'} onValueChange={(v) => updateLocal('commission_type', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold w-full bg-white border-slate-200 w-full"><SelectValue placeholder="Semua tipe" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__" className="text-xs">Semua tipe</SelectItem>
                                        <SelectItem value="percent" className="text-xs font-semibold">Persentase (%)</SelectItem>
                                        <SelectItem value="fixed" className="text-xs font-semibold">Nominal Tetap (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter status */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Status Keaktifan</Label>
                                <Select value={localFilters.is_active !== '' ? String(localFilters.is_active) : '__all__'} onValueChange={(v) => updateLocal('is_active', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold w-full bg-white border-slate-200 w-full"><SelectValue placeholder="Semua status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__" className="text-xs">Semua status</SelectItem>
                                        <SelectItem value="true" className="text-xs font-semibold">Aktif</SelectItem>
                                        <SelectItem value="false" className="text-xs font-semibold">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Apply button */}
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                            <Button className="w-full bg-primary text-white font-extrabold text-xs h-9 shadow-sm" onClick={() => applyFilters()}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Reset button jika aktif */}
                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 text-xs font-bold hover:bg-slate-100 h-9">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                {/* Info total */}
                <span className="text-xs text-slate-500 font-extrabold hidden sm:block bg-slate-100 border px-3 py-1.5 rounded-full shrink-0">
                    {totalSales} personel sales
                </span>
            </div>

            {/* Chips filter aktif */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {localFilters.branch_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Cabang: {branches.find(b => b.id === localFilters.branch_id)?.name ?? '...'}
                            <button onClick={() => {
 updateLocal('branch_id', ''); applyFilters({ branch_id: undefined }); 
}} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.commission_type && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Tipe Komisi: {localFilters.commission_type === 'percent' ? 'Persentase' : 'Nominal Tetap'}
                            <button onClick={() => {
 updateLocal('commission_type', ''); applyFilters({ commission_type: undefined }); 
}} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.is_active !== '' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Status: {localFilters.is_active === 'true' ? 'Aktif' : 'Nonaktif'}
                            <button onClick={() => {
 updateLocal('is_active', ''); applyFilters({ is_active: undefined }); 
}} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

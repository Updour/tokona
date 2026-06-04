import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisitFiltersProps {
    salesPersons: any[];
    filters?: any;
    totalVisits: number;
}

export function VisitFilters({ salesPersons = [], filters = {}, totalVisits }: VisitFiltersProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [localFilters, setLocalFilters] = useState({
        sales_id: filters?.sales_id || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
    });

    const activeFilterCount = [
        localFilters.sales_id,
        localFilters.start_date,
        localFilters.end_date,
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
            sales_id: localFilters.sales_id || undefined,
            start_date: localFilters.start_date || undefined,
            end_date: localFilters.end_date || undefined,
            ...overrides,
        };

        Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
        router.get('/sales/visits', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({
            sales_id: '',
            start_date: '',
            end_date: '',
        });
        router.get('/sales/visits', {}, { preserveState: false, replace: true });
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
                        placeholder="Cari nama sales atau outlet..."
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
                            <p className="text-xs font-black text-slate-800">Filter Kunjungan</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-[10px] font-bold text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset semua
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Filter Salesperson */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-primary-600" /> Salesperson
                                </Label>
                                <Select value={localFilters.sales_id || '__all__'} onValueChange={(v) => updateLocal('sales_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold w-full bg-white border-slate-200 w-full"><SelectValue placeholder="Semua Sales" /></SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        <SelectItem value="__all__" className="text-xs">Semua Sales</SelectItem>
                                        {salesPersons.map((s) => (
                                            <SelectItem key={s.id} value={s.id} className="text-xs font-semibold">
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Tanggal Dari */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-primary-600" /> Dari Tanggal
                                </Label>
                                <Input
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => updateLocal('start_date', e.target.value)}
                                    className="h-9 text-xs font-semibold shadow-xs"
                                />
                            </div>

                            {/* Filter Tanggal Sampai */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-primary-500" /> Sampai Tanggal
                                </Label>
                                <Input
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => updateLocal('end_date', e.target.value)}
                                    className="h-9 text-xs font-semibold shadow-xs"
                                />
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
                    {totalVisits} kunjungan
                </span>
            </div>

            {/* Chips filter aktif */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {localFilters.sales_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Salesperson: {salesPersons.find(s => s.id === localFilters.sales_id)?.name ?? '...'}
                            <button onClick={() => { updateLocal('sales_id', ''); applyFilters({ sales_id: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.start_date && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Mulai: {localFilters.start_date}
                            <button onClick={() => { updateLocal('start_date', ''); applyFilters({ start_date: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.end_date && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] px-2.5 py-1 font-bold shadow-xs">
                            Sampai: {localFilters.end_date}
                            <button onClick={() => { updateLocal('end_date', ''); applyFilters({ end_date: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

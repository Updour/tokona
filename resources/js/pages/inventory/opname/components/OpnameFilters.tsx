import { formatNumber } from '@/lib/helpers/format';
import { router } from '@inertiajs/react';
import {
    Search, SlidersHorizontal, X, CalendarRange, Download, UploadCloud, Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useOpnameStore } from '../stores/useOpnameStore';

interface OpnameFiltersProps {
    filters: Record<string, any>;
    totalResults: number;
    onAddClick: () => void;
    onExport: () => void;
}

export function OpnameFilters({
    filters,
    totalResults,
    onAddClick,
    onExport,
}: OpnameFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const openImport = useOpnameStore((state) => state.openImport);

    const activeFilterCount = [
        localFilters.start_date,
        localFilters.end_date,
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
            start_date: localFilters.start_date || undefined,
            end_date: localFilters.end_date || undefined,
            ...overrides,
        };

        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
        );

        router.get('/inventory/opname', cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({
            start_date: '',
            end_date: '',
        });
        router.get('/inventory/opname', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateLocal = (key: keyof typeof localFilters, val: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari No Referensi..."
                            className="pl-9 h-9 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-9">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">Filter</span>
                                {activeFilterCount > 0 && (
                                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-0" align="start">
                            <div className="px-4 py-3 border-b flex items-center justify-between">
                                <p className="text-sm font-semibold">Filter Opname</p>
                                {activeFilterCount > 0 && (
                                    <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                        <X className="h-3 w-3" /> Reset semua
                                    </button>
                                )}
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Filter date range */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <CalendarRange className="h-3 w-3" /> Tanggal Opname
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-1">Dari</p>
                                            <Input type="date" className="h-8 text-sm" value={localFilters.start_date} onChange={(e) => updateLocal('start_date', e.target.value)} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-1">Sampai</p>
                                            <Input type="date" className="h-8 text-sm" value={localFilters.end_date} onChange={(e) => updateLocal('end_date', e.target.value)} />
                                        </div>
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

                    {/* Reset jika ada filter aktif */}
                    {(activeFilterCount > 0 || search) && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9">
                            <X className="h-3.5 w-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Info total */}
                <span className="text-sm text-muted-foreground hidden sm:block mr-2">
                    {formatNumber(totalResults)} opname
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Import */}
                    <Button variant="outline" size="sm" onClick={() => openImport()} className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <UploadCloud className="h-4 w-4" /> <span className="hidden sm:inline">Import</span>
                    </Button>

                    {/* Export */}
                    <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
                        <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
                    </Button>

                    {/* Tambah */}
                    <Button size="sm" onClick={onAddClick} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Mulai Opname
                    </Button>
                </div>
            </div>
            
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.start_date && (
                        <FilterChip
                            label={`Dari: ${localFilters.start_date}`}
                            onRemove={() => { updateLocal('start_date', ''); applyFilters({ start_date: undefined }); }}
                        />
                    )}
                    {localFilters.end_date && (
                        <FilterChip
                            label={`Sampai: ${localFilters.end_date}`}
                            onRemove={() => { updateLocal('end_date', ''); applyFilters({ end_date: undefined }); }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <Badge variant="secondary" className="px-2 py-0.5 h-6 text-xs font-normal flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-0">
            {label}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="ml-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
                <X className="h-3 w-3" />
            </button>
        </Badge>
    );
}

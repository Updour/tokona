import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, ArrowDownAZ, ArrowUpZA, Clock, Plus } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TypeFiltersProps {
    filters: Record<string, any>;
    totalResults: number;
    onAddClick: () => void;
}

export function TypeFilters({
    filters,
    totalResults,
    onAddClick,
}: TypeFiltersProps) {
    const safeFilters = Array.isArray(filters) ? {} : (filters || {});
    const [search, setSearch] = useState(safeFilters.search || '');
    const [sort, setSort] = useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : '');
    const [direction, setDirection] = useState(safeFilters.direction || '');

    const activeFilterCount = [sort].filter(Boolean).length;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search !== (safeFilters.search || '')) {
                applyFilters({ search });
            }
        }, 350);

        return () => clearTimeout(handler);
    }, [search]);

    const applyFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            search: search || undefined,
            sort: sort || undefined,
            direction: direction || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/product-types', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setSort('');
        setDirection('');
        router.get('/product-types', {}, { preserveState: false, replace: true });
    };

    const getSortLabel = () => {
        if (sort === 'name' && direction === 'asc') {
return 'Nama (A-Z)';
}

        if (sort === 'name' && direction === 'desc') {
return 'Nama (Z-A)';
}

        if (sort === 'created_at' && direction === 'desc') {
return 'Terbaru';
}

        if (sort === 'created_at' && direction === 'asc') {
return 'Terlama';
}

        return '';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari tipe produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-9 text-xs"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 h-9 text-xs">
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
                            <p className="text-sm font-semibold">Filter & Urutkan</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Urutkan Berdasarkan</Label>
                                <Select 
                                    value={sort ? `${sort}-${direction}` : '-'} 
                                    onValueChange={(v) => {
                                        if (v === '-') {
                                            setSort(''); setDirection('');
                                            applyFilters({ sort: undefined, direction: undefined });
                                        } else {
                                            const [s, d] = v.split('-');
                                            setSort(s); setDirection(d);
                                            applyFilters({ sort: s, direction: d });
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Pilih pengurutan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="-">Default</SelectItem>
                                        <SelectItem value="name-asc">
                                            <div className="flex items-center gap-2"><ArrowDownAZ className="h-4 w-4"/> Nama (A-Z)</div>
                                        </SelectItem>
                                        <SelectItem value="name-desc">
                                            <div className="flex items-center gap-2"><ArrowUpZA className="h-4 w-4"/> Nama (Z-A)</div>
                                        </SelectItem>
                                        <SelectItem value="created_at-desc">
                                            <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> Terbaru</div>
                                        </SelectItem>
                                        <SelectItem value="created_at-asc">
                                            <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> Terlama</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9 text-xs">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />
                
                <span className="text-xs text-muted-foreground hidden sm:block">
                    {totalResults.toLocaleString('id-ID')} tipe
                </span>

                <Button onClick={onAddClick} size="sm" className="gap-1.5 h-9 text-xs">
                    <Plus className="h-4 w-4" /> Tambah Tipe
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {sort && direction && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Urutan: {getSortLabel()}
                            <button onClick={() => {
 setSort(''); setDirection(''); applyFilters({ sort: undefined, direction: undefined }); 
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

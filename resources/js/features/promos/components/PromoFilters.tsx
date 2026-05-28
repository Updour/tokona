import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X, Plus, Filter, Tag } from 'lucide-react';

interface PromoFiltersProps {
    filters: Record<string, any>;
    totalResults: number;
    onAddClick: () => void;
}

export function PromoFilters({ filters, totalResults, onAddClick }: PromoFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        type: filters.type || '',
    });

    useEffect(() => {
        setLocalFilters({
            status: filters.status || '',
            type: filters.type || '',
        });
    }, [filters]);

    const activeFilterCount = [
        localFilters.status,
        localFilters.type,
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
            status: localFilters.status || undefined,
            type: localFilters.type || undefined,
            ...overrides,
        };

        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        setOpen(false);
        router.get('/promos', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ status: '', type: '' });
        router.get('/promos', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama promo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-9 text-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 h-9">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0" align="start">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <p className="text-sm font-semibold">Filter Promo</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Filter className="h-3 w-3" /> Status Promo
                                </Label>
                                <Select value={localFilters.status || '__all__'} onValueChange={(v) => updateLocal('status', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Mati (Non-Aktif)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Tag className="h-3 w-3" /> Tipe Diskon
                                </Label>
                                <Select value={localFilters.type || '__all__'} onValueChange={(v) => updateLocal('type', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Tipe</SelectItem>
                                        <SelectItem value="percentage">Persentase (%)</SelectItem>
                                        <SelectItem value="fixed">Rupiah (Rp)</SelectItem>
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
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                <span className="text-sm text-muted-foreground hidden sm:block">
                    {totalResults.toLocaleString('id-ID')} promo
                </span>

                <Button size="sm" onClick={onAddClick} className="gap-1.5 h-9">
                    <Plus className="h-4 w-4" /> Buat Promo Baru
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.status && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Status: {localFilters.status === 'active' ? 'AKTIF' : 'NON-AKTIF'}
                            <button onClick={() => { updateLocal('status', ''); applyFilters({ status: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.type && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs px-2.5 py-1 font-medium">
                            Tipe: {localFilters.type === 'percentage' ? 'PERSENTASE (%)' : 'RUPIAH (RP)'}
                            <button onClick={() => { updateLocal('type', ''); applyFilters({ type: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

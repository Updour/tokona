import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X, Plus, Download, Users } from 'lucide-react';

interface CustomerFiltersProps {
    filters: Record<string, any>;
    totalResults: number;
    onAddClick: () => void;
    onExport: () => void;
}

export function CustomerFilters({ filters, totalResults, onAddClick, onExport }: CustomerFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        tier: filters.tier || '',
    });

    // Sinkronisasi state lokal dengan prop filters dari backend (misal saat reset atau hapus chip)
    useEffect(() => {
        setLocalFilters({
            tier: filters.tier || '',
        });
    }, [filters]);

    const activeFilterCount = [
        localFilters.tier,
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
            tier: localFilters.tier || undefined,
            ...overrides,
        };

        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        setOpen(false); // Tutup popover otomatis setelah filter diterapkan
        router.get('/customers', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ tier: '' });
        router.get('/customers', {}, { preserveState: false, replace: true });
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
                        placeholder="Cari nama, HP, email..."
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
                            <p className="text-sm font-semibold">Filter Pelanggan</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Users className="h-3 w-3" /> Level / Tier
                                </Label>
                                <Select value={localFilters.tier || '__all__'} onValueChange={(v) => updateLocal('tier', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Tier" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Tier</SelectItem>
                                        <SelectItem value="regular">Reguler (Standar)</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="wholesale">Grosir</SelectItem>
                                        <SelectItem value="distributor">Distributor</SelectItem>
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
                    {totalResults.toLocaleString('id-ID')} pelanggan
                </span>

                <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5 h-9">
                    <Download className="h-4 w-4" /> Export
                </Button>

                <Button size="sm" onClick={onAddClick} className="gap-1.5 h-9">
                    <Plus className="h-4 w-4" /> Tambah Pelanggan
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.tier && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Tier: {localFilters.tier.toUpperCase()}
                            <button onClick={() => { updateLocal('tier', ''); applyFilters({ tier: undefined }); }} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

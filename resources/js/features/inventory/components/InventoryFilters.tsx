import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, Building2, Layers, Calendar, Download } from 'lucide-react';
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

interface InventoryFiltersProps {
    filters: Record<string, any>;
    branches: any[];
    totalResults: number;
}

export function InventoryFilters({
    filters,
    branches,
    totalResults,
}: InventoryFiltersProps) {
    const safeFilters = Array.isArray(filters) ? {} : (filters || {});
    const [search, setSearch] = useState(safeFilters.search || '');
    const [localFilters, setLocalFilters] = useState({
        type: safeFilters.type || '',
        branch_id: safeFilters.branch_id || '',
        start_date: safeFilters.start_date || '',
        end_date: safeFilters.end_date || '',
    });

    const activeFilterCount = [
        localFilters.type,
        localFilters.branch_id,
        localFilters.start_date,
        localFilters.end_date,
    ].filter(Boolean).length;

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
            type: localFilters.type || undefined,
            branch_id: localFilters.branch_id || undefined,
            start_date: localFilters.start_date || undefined,
            end_date: localFilters.end_date || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/inventory', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ type: '', branch_id: '', start_date: '', end_date: '' });
        router.get('/inventory', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (localFilters.type) params.append('type', localFilters.type);
        if (localFilters.branch_id) params.append('branch_id', localFilters.branch_id);
        if (localFilters.start_date) params.append('start_date', localFilters.start_date);
        if (localFilters.end_date) params.append('end_date', localFilters.end_date);
        
        window.open(`/export/inventory?${params.toString()}`, '_blank');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama produk / SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[340px] p-0" align="start">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <p className="text-sm font-semibold">Filter Pergerakan Stok</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset semua
                                </button>
                            )}
                        </div>
                        <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Layers className="h-3 w-3" /> Tipe Pergerakan
                                </Label>
                                <Select value={localFilters.type || '__all__'} onValueChange={(v) => updateLocal('type', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Tipe</SelectItem>
                                        <SelectItem value="IN">Stok Masuk</SelectItem>
                                        <SelectItem value="OUT">Stok Keluar</SelectItem>
                                        <SelectItem value="RETURN">Retur</SelectItem>
                                        <SelectItem value="ADJUST">Opname (Adjust)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {branches && branches.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3" /> Cabang
                                    </Label>
                                    <Select value={localFilters.branch_id || '__all__'} onValueChange={(v) => updateLocal('branch_id', v === '__all__' ? '' : v)}>
                                        <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua cabang" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Semua cabang</SelectItem>
                                            {branches.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Date Filters */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Dari
                                    </Label>
                                    <Input
                                        type="date"
                                        value={localFilters.start_date}
                                        onChange={(e) => updateLocal('start_date', e.target.value)}
                                        className="h-8 text-xs font-semibold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Sampai
                                    </Label>
                                    <Input
                                        type="date"
                                        value={localFilters.end_date}
                                        onChange={(e) => updateLocal('end_date', e.target.value)}
                                        className="h-8 text-xs font-semibold"
                                    />
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

                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                {/* Excel Export Button */}
                <Button 
                    onClick={handleExport} 
                    variant="outline" 
                    className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 h-9 text-xs font-bold shadow-sm"
                >
                    <Download className="h-3.5 w-3.5" />
                    Ekspor Excel
                </Button>

                <span className="text-sm text-muted-foreground hidden sm:block">
                    {totalResults.toLocaleString('id-ID')} riwayat
                </span>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.type && (
                        <FilterChip
                            label={`Tipe: ${localFilters.type === 'IN' ? 'Stok Masuk' : localFilters.type === 'OUT' ? 'Stok Keluar' : localFilters.type === 'RETURN' ? 'Retur' : 'Opname (Adjust)'}`}
                            onRemove={() => {
                                updateLocal('type', '');
                                applyFilters({ type: undefined }); 
                            }}
                        />
                    )}
                    {localFilters.branch_id && branches && (
                        <FilterChip
                            label={`Cabang: ${branches.find((b) => b.id == localFilters.branch_id)?.name ?? '...'}`}
                            onRemove={() => {
                                updateLocal('branch_id', '');
                                applyFilters({ branch_id: undefined }); 
                            }}
                        />
                    )}
                    {localFilters.start_date && (
                        <FilterChip
                            label={`Dari: ${localFilters.start_date}`}
                            onRemove={() => {
                                updateLocal('start_date', '');
                                applyFilters({ start_date: undefined }); 
                            }}
                        />
                    )}
                    {localFilters.end_date && (
                        <FilterChip
                            label={`Sampai: ${localFilters.end_date}`}
                            onRemove={() => {
                                updateLocal('end_date', '');
                                applyFilters({ end_date: undefined }); 
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
            {label}
            <button onClick={onRemove} className="hover:text-destructive ml-0.5">
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}

import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, Plus, Download, PackageOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConsignmentFiltersProps {
    filters: Record<string, any>;
    suppliers: any[];
    totalResults: number;
    onAddClick: () => void;
    onExport: () => void;
}

export function ConsignmentFilters({
    filters,
    suppliers,
    totalResults,
    onAddClick,
    onExport,
}: ConsignmentFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        supplier_id: filters.supplier_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const activeFilterCount = [
        localFilters.status,
        localFilters.supplier_id,
        localFilters.date_from,
        localFilters.date_to,
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
            supplier_id: localFilters.supplier_id || undefined,
            date_from: localFilters.date_from || undefined,
            date_to: localFilters.date_to || undefined,
            ...overrides,
        };

        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/consignments', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ status: '', supplier_id: '', date_from: '', date_to: '' });
        router.get('/consignments', {}, { preserveState: false, replace: true });
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
                        placeholder="Cari berdasarkan No. Referensi..."
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
                            <p className="text-sm font-semibold">Filter Titipan</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset semua
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Status Titipan</Label>
                                <Select value={localFilters.status || '__all__'} onValueChange={(v) => updateLocal('status', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua status</SelectItem>
                                        <SelectItem value="active">Berjalan (Belum Setor)</SelectItem>
                                        <SelectItem value="settled">Selesai (Sudah Setor)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <PackageOpen className="h-3 w-3" /> Supplier
                                </Label>
                                <Select value={localFilters.supplier_id || '__all__'} onValueChange={(v) => updateLocal('supplier_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua supplier" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua supplier</SelectItem>
                                        {suppliers?.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <PackageOpen className="h-3 w-3" /> Tanggal Titip
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Dari</p>
                                        <Input type="date" className="h-8 text-sm" value={localFilters.date_from} onChange={(e) => updateLocal('date_from', e.target.value)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Sampai</p>
                                        <Input type="date" className="h-8 text-sm" value={localFilters.date_to} onChange={(e) => updateLocal('date_to', e.target.value)} />
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

                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                <span className="text-sm text-muted-foreground hidden sm:block">
                    {totalResults.toLocaleString('id-ID')} titipan
                </span>

                <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
                    <Download className="h-4 w-4" /> Export
                </Button>

                <Button size="sm" onClick={onAddClick} className="gap-1.5">
                    <PackageOpen className="h-4 w-4" /> Terima Titipan Baru
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.status && (
                        <FilterChip
                            label={`Status: ${localFilters.status === 'active' ? 'Berjalan' : 'Selesai'}`}
                            onRemove={() => { updateLocal('status', ''); applyFilters({ status: undefined }); }}
                        />
                    )}
                    {localFilters.supplier_id && (
                        <FilterChip
                            label={`Supplier: ${suppliers.find((s) => s.id == localFilters.supplier_id)?.name ?? '...'}`}
                            onRemove={() => { updateLocal('supplier_id', ''); applyFilters({ supplier_id: undefined }); }}
                        />
                    )}
                    {(localFilters.date_from || localFilters.date_to) && (
                        <FilterChip
                            label={`Tanggal: ${localFilters.date_from || '...'} → ${localFilters.date_to || '...'}`}
                            onRemove={() => {
                                updateLocal('date_from', ''); updateLocal('date_to', ''); 
                                applyFilters({ date_from: undefined, date_to: undefined }); 
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

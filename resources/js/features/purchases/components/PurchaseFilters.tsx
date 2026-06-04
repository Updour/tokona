import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X, Plus, Filter, CalendarDays, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PurchaseFiltersProps {
    filters: Record<string, any>;
    branches: any[];
    totalResults: number;
    onAddClick: () => void;
}

export function PurchaseFilters({ filters, branches, totalResults, onAddClick }: PurchaseFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        branch_id: filters.branch_id || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    // Sinkronisasi state lokal dengan prop filters dari backend (misal saat reset atau hapus chip)
    useEffect(() => {
        setLocalFilters({
            status: filters.status || '',
            branch_id: filters.branch_id || '',
            start_date: filters.start_date || '',
            end_date: filters.end_date || '',
        });
    }, [filters]);

    const activeFilterCount = [
        localFilters.status,
        localFilters.branch_id,
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
            status: localFilters.status || undefined,
            branch_id: localFilters.branch_id || undefined,
            start_date: localFilters.start_date || undefined,
            end_date: localFilters.end_date || undefined,
            ...overrides,
        };

        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        setOpen(false); // Tutup popover otomatis setelah filter diterapkan
        router.get('/purchases', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ status: '', branch_id: '', start_date: '', end_date: '' });
        router.get('/purchases', {}, { preserveState: false, replace: true });
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
                        placeholder="Cari Nomor Invoice..."
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
                    <PopoverContent className="w-[380px] p-0" align="start">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <p className="text-sm font-semibold">Filter Pembelian</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Filter className="h-3 w-3" /> Status
                                </Label>
                                <Select value={localFilters.status || '__all__'} onValueChange={(v) => updateLocal('status', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Status</SelectItem>
                                        <SelectItem value="draft">Draft (Direncanakan)</SelectItem>
                                        <SelectItem value="received">Diterima (Belum Lunas)</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3" /> Cabang
                                </Label>
                                <Select value={localFilters.branch_id || '__all__'} onValueChange={(v) => updateLocal('branch_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue placeholder="Semua Cabang" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua Cabang</SelectItem>
                                        {branches?.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <CalendarDays className="h-3 w-3" /> Tanggal Pembelian
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={localFilters.start_date}
                                        onChange={(e) => updateLocal('start_date', e.target.value)}
                                        placeholder="Dari"
                                    />
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={localFilters.end_date}
                                        onChange={(e) => updateLocal('end_date', e.target.value)}
                                        placeholder="Sampai"
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

                <span className="text-sm text-muted-foreground hidden sm:block">
                    {totalResults.toLocaleString('id-ID')} tagihan
                </span>

                <Button size="sm" onClick={onAddClick} className="gap-1.5 h-9">
                    <Plus className="h-4 w-4" /> Tambah Pembelian
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.status && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Status: {localFilters.status.toUpperCase()}
                            <button onClick={() => {
 updateLocal('status', ''); applyFilters({ status: undefined }); 
}} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {localFilters.branch_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs px-2.5 py-1 font-medium">
                            Cabang: {branches?.find((b) => b.id === localFilters.branch_id)?.name || 'Terpilih'}
                            <button onClick={() => {
 updateLocal('branch_id', ''); applyFilters({ branch_id: undefined }); 
}} className="hover:text-destructive ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {(localFilters.start_date || localFilters.end_date) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 text-xs px-2.5 py-1 font-medium">
                            Tanggal: {localFilters.start_date || 'Awal'} - {localFilters.end_date || 'Akhir'}
                            <button onClick={() => {
                                updateLocal('start_date', '');
                                updateLocal('end_date', '');
                                applyFilters({ start_date: undefined, end_date: undefined });
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

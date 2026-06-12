import { formatNumber } from '@/lib/helpers/format';
import { router } from '@inertiajs/react';
import {
    Search, SlidersHorizontal, X, CalendarRange,
    Building2, Tag, Layers, AlertTriangle, Plus, Download, UploadCloud
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import type {ProductCategory, ProductType, ProductBranch, ProductTenant} from '@/pages/products/types';
import { useProductStore } from '@/pages/products/stores/useProductStore';

interface ProductFiltersProps {
    filters: Record<string, any>;
    categories: ProductCategory[];
    types: ProductType[];
    branches: ProductBranch[];
    tenants?: ProductTenant[] | null;
    isSuperAdmin?: boolean;
    totalResults: number;
    onAddClick: () => void;
    onExport: () => void;
}

export function ProductFilters({
    filters,
    categories,
    types,
    branches,
    tenants,
    isSuperAdmin = false,
    totalResults,
    onAddClick,
    onExport,
}: ProductFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        category_id: filters.category_id || '',
        type_id: filters.type_id || '',
        branch_id: filters.branch_id || '',
        tenant_id: filters.tenant_id || '',
        is_active: filters.is_active ?? '',
        low_stock: filters.low_stock === 'true' || filters.low_stock === true,
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        price_min: filters.price_min || '',
        price_max: filters.price_max || '',
    });

    const openImport = useProductStore((state) => state.openImport);

    // Hitung berapa filter aktif (selain search)
    const activeFilterCount = [
        localFilters.category_id,
        localFilters.type_id,
        localFilters.branch_id,
        localFilters.tenant_id,
        localFilters.is_active !== '',
        localFilters.low_stock,
        localFilters.date_from,
        localFilters.date_to,
        localFilters.price_min,
        localFilters.price_max,
    ].filter(Boolean).length;

    // Debounce search
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
            category_id: localFilters.category_id || undefined,
            type_id: localFilters.type_id || undefined,
            branch_id: localFilters.branch_id || undefined,
            tenant_id: localFilters.tenant_id || undefined,
            is_active: localFilters.is_active !== '' ? localFilters.is_active : undefined,
            low_stock: localFilters.low_stock ? 'true' : undefined,
            date_from: localFilters.date_from || undefined,
            date_to: localFilters.date_to || undefined,
            price_min: localFilters.price_min || undefined,
            price_max: localFilters.price_max || undefined,
            ...overrides,
        };

        // Bersihkan undefined
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

        router.get('/products', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({
            category_id: '', type_id: '', branch_id: '', tenant_id: '',
            is_active: '', low_stock: false,
            date_from: '', date_to: '', price_min: '', price_max: '',
        });
        router.get('/products', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-3">
            {/* Baris utama: search + filter button + actions */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama, SKU, barcode..."
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

                {/* Filter popover */}
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
                    <PopoverContent className="w-[440px] p-0" align="start">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <p className="text-sm font-semibold">Filter Produk</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset semua
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">

                            {/* Super admin: filter tenant */}
                            {isSuperAdmin && tenants && tenants.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3" /> Tenant
                                    </Label>
                                    <Select value={localFilters.tenant_id || '__all__'} onValueChange={(v) => updateLocal('tenant_id', v === '__all__' ? '' : v)}>
                                        <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua tenant" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Semua tenant</SelectItem>
                                            {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Filter cabang */}
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
                                                {b.name}{b.code && <span className="ml-1 text-muted-foreground font-mono text-xs">({b.code})</span>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter kategori */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Tag className="h-3 w-3" /> Kategori
                                </Label>
                                <Select value={localFilters.category_id || '__all__'} onValueChange={(v) => updateLocal('category_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua kategori" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua kategori</SelectItem>
                                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter tipe */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Layers className="h-3 w-3" /> Tipe Produk
                                </Label>
                                <Select value={localFilters.type_id || '__all__'} onValueChange={(v) => updateLocal('type_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua tipe" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua tipe</SelectItem>
                                        {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter status */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
                                <Select value={localFilters.is_active !== '' ? String(localFilters.is_active) : '__all__'} onValueChange={(v) => updateLocal('is_active', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua status</SelectItem>
                                        <SelectItem value="true">Aktif</SelectItem>
                                        <SelectItem value="false">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Filter date range */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <CalendarRange className="h-3 w-3" /> Tanggal Dibuat
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

                            {/* Filter harga */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Rentang Harga Jual</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Min (Rp)</p>
                                        <Input type="number" min="0" className="h-8 text-sm" placeholder="0" value={localFilters.price_min} onChange={(e) => updateLocal('price_min', e.target.value)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Maks (Rp)</p>
                                        <Input type="number" min="0" className="h-8 text-sm" placeholder="∞" value={localFilters.price_max} onChange={(e) => updateLocal('price_max', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Stok menipis */}
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox
                                    checked={localFilters.low_stock}
                                    onCheckedChange={(c) => updateLocal('low_stock', !!c)}
                                />
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        Stok Menipis / Habis
                                    </p>
                                    <p className="text-xs text-muted-foreground">Tampilkan produk dengan stok ≤ 5</p>
                                </div>
                            </label>
                        </div>

                        {/* Apply button */}
                        <div className="px-4 py-3 border-t">
                            <Button className="w-full" size="sm" onClick={() => applyFilters()}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Reset jika ada filter aktif */}
                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Info total */}
                <span className="text-sm text-muted-foreground hidden sm:block">
                    {formatNumber(totalResults)} produk
                </span>

                {/* Import */}
                <Button variant="outline" size="sm" onClick={() => openImport()} className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <UploadCloud className="h-4 w-4" /> Import Excel
                </Button>

                {/* Export */}
                <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
                    <Download className="h-4 w-4" /> Export
                </Button>

                {/* Tambah produk */}
                <Button size="sm" onClick={onAddClick} className="gap-1.5">
                    <Plus className="h-4 w-4" /> Tambah Produk
                </Button>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.category_id && (
                        <FilterChip
                            label={`Kategori: ${categories.find((c) => c.id === localFilters.category_id)?.name ?? '...'}`}
                            onRemove={() => { updateLocal('category_id', ''); applyFilters({ category_id: undefined }); }}
                        />
                    )}
                    {localFilters.type_id && (
                        <FilterChip
                            label={`Tipe: ${types.find((t) => t.id === localFilters.type_id)?.name ?? '...'}`}
                            onRemove={() => { updateLocal('type_id', ''); applyFilters({ type_id: undefined }); }}
                        />
                    )}
                    {localFilters.branch_id && (
                        <FilterChip
                            label={`Cabang: ${branches.find((b) => b.id === localFilters.branch_id)?.name ?? '...'}`}
                            onRemove={() => { updateLocal('branch_id', ''); applyFilters({ branch_id: undefined }); }}
                        />
                    )}
                    {localFilters.tenant_id && tenants && (
                        <FilterChip
                            label={`Tenant: ${tenants.find((t) => t.id === localFilters.tenant_id)?.name ?? '...'}`}
                            onRemove={() => { updateLocal('tenant_id', ''); applyFilters({ tenant_id: undefined }); }}
                        />
                    )}
                    {localFilters.is_active !== '' && (
                        <FilterChip
                            label={localFilters.is_active === 'true' || localFilters.is_active === true ? 'Status: Aktif' : 'Status: Nonaktif'}
                            onRemove={() => { updateLocal('is_active', ''); applyFilters({ is_active: undefined }); }}
                        />
                    )}
                    {localFilters.low_stock && (
                        <FilterChip
                            label="Stok menipis"
                            onRemove={() => { updateLocal('low_stock', false); applyFilters({ low_stock: undefined }); }}
                        />
                    )}
                    {(localFilters.date_from || localFilters.date_to) && (
                        <FilterChip
                            label={`Tanggal: ${localFilters.date_from || '...'} → ${localFilters.date_to || '...'}`}
                            onRemove={() => { updateLocal('date_from', ''); updateLocal('date_to', ''); applyFilters({ date_from: undefined, date_to: undefined }); }}
                        />
                    )}
                    {(localFilters.price_min || localFilters.price_max) && (
                        <FilterChip
                            label={`Harga: Rp${localFilters.price_min || '0'} – Rp${localFilters.price_max || '∞'}`}
                            onRemove={() => { updateLocal('price_min', ''); updateLocal('price_max', ''); applyFilters({ price_min: undefined, price_max: undefined }); }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Filter chip kecil ────────────────────────────────────────────────────────
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

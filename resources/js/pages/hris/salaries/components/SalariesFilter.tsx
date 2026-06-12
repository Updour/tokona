import { formatNumber } from '@/lib/helpers/format';
import React from 'react';
import { Search, SlidersHorizontal, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface Props {
    search: string;
    setSearch: (val: string) => void;
    localFilters: any;
    updateLocal: (key: string, val: any) => void;
    applyFilters: (overrides?: any) => void;
    resetFilters: () => void;
    activeFilterCount: number;
    is_super_admin: boolean;
    tenants: any[];
    branches: any[];
    total: number;
}

export default function SalariesFilter({
    search, setSearch, localFilters, updateLocal, applyFilters, resetFilters,
    activeFilterCount, is_super_admin, tenants, branches, total
}: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama karyawan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-9"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-9">
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
                            <p className="text-sm font-semibold">Filter Data</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            {is_super_admin && tenants && tenants.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3" /> Tenant
                                    </Label>
                                    <Select value={localFilters.tenant_id || '__all__'} onValueChange={(v) => updateLocal('tenant_id', v === '__all__' ? '' : v)}>
                                        <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua tenant" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Semua tenant</SelectItem>
                                            {tenants.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3" /> Cabang
                                </Label>
                                <Select value={localFilters.branch_id || '__all__'} onValueChange={(v) => updateLocal('branch_id', v === '__all__' ? '' : v)}>
                                    <SelectTrigger className="h-8 text-sm w-full"><SelectValue placeholder="Semua cabang" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Semua cabang</SelectItem>
                                        {branches?.map((b: any) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
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
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                <span className="text-sm text-muted-foreground hidden sm:block mr-2">
                    {formatNumber(total)} data
                </span>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {localFilters.branch_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Cabang: {branches?.find((b: any) => b.id === localFilters.branch_id)?.name ?? '...'}
                            <button onClick={() => { updateLocal('branch_id', ''); applyFilters({ branch_id: undefined }); }} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    {localFilters.tenant_id && tenants && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Tenant: {tenants?.find((t: any) => t.id === localFilters.tenant_id)?.name ?? '...'}
                            <button onClick={() => { updateLocal('tenant_id', ''); applyFilters({ tenant_id: undefined }); }} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

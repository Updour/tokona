import { Search, SlidersHorizontal, X, Coins, Receipt, CalendarRange, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PosTransactionFiltersProps {
    search: string;
    setSearch: (v: string) => void;
    localFilters: any;
    setLocalFilters: (v: any) => void;
    filteredCount: number;
    handleExport: () => void;
    resetFilters: () => void;
}

export function PosTransactionFilters({
    search, setSearch, localFilters, setLocalFilters, filteredCount, handleExport, resetFilters
}: PosTransactionFiltersProps) {
    const activeFilterCount = [
        localFilters.payment_method !== 'all',
        localFilters.status !== 'all',
        localFilters.date_range !== 'all'
    ].filter(Boolean).length;

    const updateLocal = (key: string, value: string) => {
        setLocalFilters({ ...localFilters, [key]: value });
    };

    return (
        <div className="space-y-4 shrink-0">
            <div className="flex items-center gap-2 flex-wrap shrink-0">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari no. faktur atau pelanggan..."
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
                    <PopoverContent className="w-[320px] p-0" align="start">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <p className="text-sm font-semibold">Filter Transaksi</p>
                            {activeFilterCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Coins className="h-3 w-3" /> Metode Pembayaran
                                </Label>
                                <Select value={localFilters.payment_method} onValueChange={(v) => updateLocal('payment_method', v)}>
                                    <SelectTrigger className="h-8 text-xs w-full">
                                        <SelectValue placeholder="Semua Metode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Metode</SelectItem>
                                        <SelectItem value="cash">Tunai (Cash)</SelectItem>
                                        <SelectItem value="transfer">Transfer / QRIS</SelectItem>
                                        <SelectItem value="split">Split Bayar</SelectItem>
                                        <SelectItem value="debt">Piutang (Debt)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Receipt className="h-3 w-3" /> Status Transaksi
                                </Label>
                                <Select value={localFilters.status} onValueChange={(v) => updateLocal('status', v)}>
                                    <SelectTrigger className="h-8 text-xs w-full">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                        <SelectItem value="returned">Diretur</SelectItem>
                                        <SelectItem value="partial">Kredit / Piutang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <CalendarRange className="h-3 w-3" /> Periode Waktu
                                </Label>
                                <Select value={localFilters.date_range} onValueChange={(v) => updateLocal('date_range', v)}>
                                    <SelectTrigger className="h-8 text-xs w-full">
                                        <SelectValue placeholder="Semua Waktu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Waktu</SelectItem>
                                        <SelectItem value="today">Hari Ini</SelectItem>
                                        <SelectItem value="yesterday">Kemarin</SelectItem>
                                        <SelectItem value="this_week">7 Hari Terakhir</SelectItem>
                                        <SelectItem value="this_month">Bulan Ini</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {(activeFilterCount > 0 || search) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1.5 h-9">
                        <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                )}

                <div className="flex-1" />

                <span className="text-xs text-muted-foreground hidden sm:block">
                    {filteredCount.toLocaleString('id-ID')} transaksi
                </span>

                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-9">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5 shrink-0">
                    {localFilters.payment_method !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Metode: {localFilters.payment_method === 'cash' ? 'Tunai' : localFilters.payment_method === 'transfer' ? 'Transfer' : localFilters.payment_method === 'split' ? 'Split' : 'Piutang'}
                            <button onClick={() => updateLocal('payment_method', 'all')} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    {localFilters.status !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Status: {localFilters.status === 'paid' ? 'Lunas' : localFilters.status === 'returned' ? 'Diretur' : 'Kredit'}
                            <button onClick={() => updateLocal('status', 'all')} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    {localFilters.date_range !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
                            Periode: {localFilters.date_range === 'today' ? 'Hari Ini' : localFilters.date_range === 'yesterday' ? 'Kemarin' : localFilters.date_range === 'this_week' ? '7 Hari Terakhir' : 'Bulan Ini'}
                            <button onClick={() => updateLocal('date_range', 'all')} className="hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

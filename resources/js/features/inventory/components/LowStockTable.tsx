import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { AlertCircle, Search, PackageX } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface Props {
    products: any;
    filters: any;
}

function StockBadge({ current, min }: { current: number; min: number }) {
    if (current <= 0) {
        return <Badge variant="destructive" className="gap-1"><PackageX className="h-3 w-3" /> Habis</Badge>;
    }

    return <Badge variant="outline" className="border-orange-400 text-orange-500 gap-1"><AlertCircle className="h-3 w-3" /> Menipis</Badge>;
}

export function LowStockTable({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const onSearch = debounce((val: string) => {
        router.get('/inventory/low-stock', { search: val || undefined }, { preserveState: true, replace: true });
    }, 400);

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => {
 setSearch(e.target.value); onSearch(e.target.value); 
}}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-red-500">{products.total}</span> produk kritis ditemukan
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Harga Jual</TableHead>
                            <TableHead className="text-center">Stok</TableHead>
                            <TableHead className="text-center">Min. Stok</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    Semua stok aman. Tidak ada produk kritis saat ini.
                                </TableCell>
                            </TableRow>
                        ) : products.data.map((p: any) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {p.images?.[0]?.url ? (
                                            <img src={p.images[0].url} alt={p.name} className="h-10 w-10 rounded-md object-cover border" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                                <PackageX className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium">{p.name}</div>
                                            {p.sku && <div className="text-xs text-muted-foreground">{p.sku}</div>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{p.category?.name || '-'}</TableCell>
                                <TableCell className="text-right">{formatRupiah(p.sell_price)}</TableCell>
                                <TableCell className="text-center font-bold text-red-500">{p.current_stock ?? 0}</TableCell>
                                <TableCell className="text-center text-muted-foreground">{p.min_stock}</TableCell>
                                <TableCell className="text-center">
                                    <StockBadge current={p.current_stock ?? 0} min={p.min_stock} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination data={products} itemName="produk" filters={filters} />
        </div>
    );
}

import { usePage, router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { columns } from './ProductColumn';
import { ProductFilters } from './ProductFilters';
import { useProductStore } from '@/pages/products/stores/useProductStore';
import {
    type Product, type ProductCategory,
    type ProductType, type ProductBranch, type ProductTenant,
} from '@/pages/products/types';

interface PageProps {
    [key: string]: any;
    products: {
        data: Product[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: Record<string, any>;
    categories: ProductCategory[];
    types: ProductType[];
    branches: ProductBranch[];
    tenants: ProductTenant[] | null;
    is_super_admin: boolean;
}

export function ProductTable() {
    const { props } = usePage<PageProps>();
    const { products, filters, categories, types, branches, tenants, is_super_admin } = props;

    const openForm = useProductStore((state) => state.openForm);
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: products?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    const handleExport = () => {
        if (!products?.data?.length) return;
        const rows = products.data.map((p) => ({
            Nama: p.name,
            SKU: p.sku ?? '',
            Barcode: p.barcode ?? '',
            Kategori: p.category?.name ?? '',
            Tipe: p.type?.name ?? '',
            Cabang: p.branch?.name ?? '',
            HPP: p.base_cost,
            'Harga Jual': p.sell_price,
            Stok: p.current_stock,
            Status: p.is_active ? 'Aktif' : 'Nonaktif',
        }));
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((r) =>
                headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'produk_export.csv';
        link.click();
    };

    return (
        <div className="w-full space-y-4">
            <ProductFilters
                filters={filters}
                categories={categories ?? []}
                types={types ?? []}
                branches={branches ?? []}
                tenants={tenants}
                isSuperAdmin={is_super_admin}
                totalResults={products?.total ?? 0}
                onAddClick={() => openForm()}
                onExport={handleExport}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    Tidak ada produk yang cocok dengan filter yang dipilih.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">
                    {products?.from && products?.to
                        ? `Menampilkan ${products.from}–${products.to} dari ${products.total.toLocaleString('id-ID')} produk`
                        : `${products?.total ?? 0} produk`}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="sm"
                        disabled={!products?.prev_page_url}
                        onClick={() => products?.prev_page_url && router.get(products.prev_page_url)}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        disabled={!products?.next_page_url}
                        onClick={() => products?.next_page_url && router.get(products.next_page_url)}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { usePage, router } from '@inertiajs/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from './PurchaseColumn';
import { PurchaseFilters } from './PurchaseFilters';

interface PageProps {
    [key: string]: any;
    purchases: {
        data: any[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search?: string;
        status?: string;
        branch_id?: string;
    };
}

export function PurchaseTable({ onAddClick }: { onAddClick: () => void }) {
    const { props } = usePage<PageProps>();
    const { purchases, filters, branches } = props;

    const table = useReactTable({
        data: purchases?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full space-y-4">
            <PurchaseFilters 
                filters={filters || {}} 
                branches={branches || []}
                totalResults={purchases?.total || 0}
                onAddClick={onAddClick}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                    Tidak ada data pembelian yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">
                    {purchases?.from && purchases?.to
                        ? `Menampilkan ${purchases.from}–${purchases.to} dari ${purchases.total.toLocaleString('id-ID')} tagihan`
                        : `${purchases?.total ?? 0} tagihan`}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={!purchases?.prev_page_url} onClick={() => purchases?.prev_page_url && router.get(purchases.prev_page_url)}>
                        Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" disabled={!purchases?.next_page_url} onClick={() => purchases?.next_page_url && router.get(purchases.next_page_url)}>
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

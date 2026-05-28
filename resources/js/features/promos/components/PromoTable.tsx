import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPromoColumns } from './PromoColumn';
import { usePage } from '@inertiajs/react';
import { PromoFilters } from './PromoFilters';

export function PromoTable({ promos, onEdit, onAddClick }: any) {
    const { props } = usePage<any>();
    const { filters } = props;

    const table = useReactTable({
        data: promos?.data || [],
        columns: getPromoColumns(onEdit),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full space-y-4">
            <PromoFilters 
                filters={filters || {}} 
                totalResults={promos?.total || 0} 
                onAddClick={onAddClick}
            />
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
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
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Belum ada data aturan diskon/promo.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">
                    {promos?.from && promos?.to
                        ? `Menampilkan ${promos.from}–${promos.to} dari ${promos.total.toLocaleString('id-ID')} promo`
                        : `${promos?.total ?? 0} promo`}
                </p>
            </div>
        </div>
    );
}

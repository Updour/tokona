import { usePage, router } from '@inertiajs/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCustomerColumns } from './CustomerColumn';
import { CustomerFilters } from './CustomerFilters';

export function CustomerTable({ customers, onEdit, onView, onAddClick }: any) {
    const { props } = usePage<any>();
    const filters = props.filters || {};

    const table = useReactTable({
        data: customers?.data || [],
        columns: getCustomerColumns(onEdit, onView),
        getCoreRowModel: getCoreRowModel(),
    });

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        window.open(`/export/customers?${params.toString()}`, '_blank');
    };

    return (
        <div className="w-full space-y-4">
            <CustomerFilters 
                filters={filters} 
                totalResults={customers?.total ?? 0} 
                onAddClick={onAddClick}
                onExport={handleExport}
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
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    Belum ada data pelanggan yang cocok dengan filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <DataTablePagination 
                data={customers as any} 
                itemName="pelanggan" 
                filters={filters} 
            />
        </div>
    );
}

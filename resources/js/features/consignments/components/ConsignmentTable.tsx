import { usePage } from '@inertiajs/react';
import type { SortingState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConsignmentStore } from '@/features/consignments/stores/useConsignmentStore';
import { formatRupiah } from '@/lib/helpers/format';
import { columns } from './ConsignmentColumn';
import { ConsignmentEditDialog } from './ConsignmentEditDialog';
import { ConsignmentFilters } from './ConsignmentFilters';

interface PageProps {
    [key: string]: any;
    consignments: {
        data: any[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: Record<string, any>;
    suppliers: any[];
}

export function ConsignmentTable() {
    const { props } = usePage<PageProps>();
    const { consignments, filters, suppliers } = props;

    const openReceiveForm = useConsignmentStore((state) => state.openReceiveForm);
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: consignments?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
        if (filters.search) params.append('search', filters.search);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        window.open(`/export/consignments?${params.toString()}`, '_blank');
    };

    return (
        <div className="w-full space-y-4">
            <ConsignmentFilters
                filters={filters}
                suppliers={suppliers || []}
                totalResults={consignments?.total ?? 0}
                onAddClick={openReceiveForm}
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
                                    Tidak ada data barang titipan yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination 
                data={consignments as any} 
                itemName="titipan" 
                filters={filters} 
            />
            <ConsignmentEditDialog />
        </div>
    );
}

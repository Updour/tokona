import { router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable
    
} from '@tanstack/react-table';
import type {
    SortingState} from '@tanstack/react-table';
import type {ColumnDef} from '@tanstack/react-table';
import { Search, Plus, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface DataTableProps<T> {
    data: {
        data: T[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    columns: ColumnDef<T, any>[];
    filters: { search?: string; [key: string]: any };
    baseUrl: string; // URL dinamis (misal: '/users' atau '/products')
    searchPlaceholder?: string;
    exportFileName?: string;
    onAddClick?: () => void;
    addButtonText?: string;
    extraParams?: Record<string, any>;
}

export function DataTable<T>({
    data,
    columns,
    filters,
    baseUrl,
    searchPlaceholder = "Search...",
    exportFileName = "export.csv",
    onAddClick,
    addButtonText = "Add Item",
    extraParams = {},
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [search, setSearch] = useState(filters?.search || '');

    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    // Debounce pencarian dan sorting otomatis mengarah ke baseUrl dinamis
    useEffect(() => {
        const handler = setTimeout(() => {
            const hasSorting = sorting.length > 0;
            
            // Check if any extra parameter has changed
            const extraParamsChanged = Object.keys(extraParams).some(
                key => extraParams[key] !== filters?.[key]
            );

            if (search !== filters?.search || hasSorting || extraParamsChanged) {
                router.get(
                    baseUrl,
                    {
                        search,
                        sort: hasSorting ? sorting[0]?.id : undefined,
                        direction: hasSorting ? (sorting[0]?.desc ? 'desc' : 'asc') : undefined,
                        ...extraParams
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [search, sorting, baseUrl, filters, extraParams]);

    const handleExport = () => {
        if (!data?.data?.length) {
return;
}

        const headers = Object.keys(data.data[0] as object);
        const csvContent = [
            headers.join(','),
            ...data.data.map((row: any) =>
                headers.map(header => {
                    const value = row[header] ?? '';

                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', exportFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={!data?.data?.length}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    {onAddClick && (
                        <Button onClick={onAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> {addButtonText}
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Bagian Paginasi Halaman */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {data?.from || 0} to {data?.to || 0} of {data?.total || 0} results.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => data?.prev_page_url && router.get(data.prev_page_url)}
                        disabled={!data?.prev_page_url}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => data?.next_page_url && router.get(data.next_page_url)}
                        disabled={!data?.next_page_url}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

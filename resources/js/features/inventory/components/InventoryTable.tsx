import { usePage, router } from '@inertiajs/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from './InventoryColumn';
import { InventoryFilters } from './InventoryFilters';
import { useState, useEffect } from 'react';

interface PageProps {
    [key: string]: any;
    movements: {
        data: any[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    branches: any[];
    filters: {
        search?: string;
        type?: string;
        branch_id?: string;
    };
}

export function InventoryTable() {
    const { props } = usePage<PageProps>();
    const { movements, branches, filters } = props;

    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'ALL');
    const [branchId, setBranchId] = useState(filters?.branch_id || 'ALL');

    const table = useReactTable({
        data: movements?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Handle filter application
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters?.search || '') || type !== (filters?.type || 'ALL') || branchId !== (filters?.branch_id || 'ALL')) {
                router.get(
                    '/inventory',
                    { search, type: type === 'ALL' ? '' : type, branch_id: branchId === 'ALL' ? '' : branchId },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search, type, branchId]);

    return (
        <div className="w-full space-y-4">
            <InventoryFilters 
                filters={filters}
                branches={branches}
                totalResults={movements?.total || 0}
            />
            {/* Table */}
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
                                    Tidak ada riwayat pergerakan stok yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">
                    {movements?.from && movements?.to
                        ? `Menampilkan ${movements.from}–${movements.to} dari ${movements.total.toLocaleString('id-ID')} riwayat`
                        : `${movements?.total ?? 0} riwayat`}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={!movements?.prev_page_url} onClick={() => movements?.prev_page_url && router.get(movements.prev_page_url)}>
                        Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" disabled={!movements?.next_page_url} onClick={() => movements?.next_page_url && router.get(movements.next_page_url)}>
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

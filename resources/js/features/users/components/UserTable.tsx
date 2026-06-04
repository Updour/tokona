import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useUserStore } from '@/pages/users/stores/useUserStore';
import type { User } from '@/pages/users/types';
import { columns } from './UserColumns';
import { UserFilters } from './UserFilters';

interface UserTableProps {
    data: {
        data: User[];
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: any;
    branches: any[];
    tenants?: any[];
}

export function UserTable({ data, filters, branches, tenants = [] }: UserTableProps) {
    const openForm = useUserStore((state) => state.openForm);
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    const handleExport = () => {
        if (!data?.data?.length) {
return;
}

        const rows = data.data.map((u) => ({
            Nama: u.name,
            Email: u.email,
            Telepon: u.phone ?? '-',
            Cabang: u.branch?.name ?? '-',
            Toko: u.tenant?.name ?? '-',
            Status: u.status === 'active' ? 'Aktif' : 'Nonaktif',
        }));
        
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((r) => headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tokona_karyawan_export.csv';
        link.click();
    };

    return (
        <div className="w-full space-y-4">
            <UserFilters
                filters={filters}
                branches={branches}
                tenants={tenants}
                totalResults={data?.total || 0}
                onAddClick={() => openForm()}
                onExport={handleExport}
            />

            <div className="rounded-md border border-slate-200 shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id} className="font-semibold text-slate-700">
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
                                <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
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
                                    Tidak ada karyawan yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination 
                data={data as any} 
                itemName="karyawan" 
                filters={filters} 
            />
        </div>
    );
}

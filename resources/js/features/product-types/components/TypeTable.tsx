import { usePage, router } from '@inertiajs/react';
import { Edit, Trash, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { TypeFilters } from './TypeFilters';

interface ProductType {
    id: string;
    name: string;
    description?: string | null;
    products_count?: number;
}

interface PageProps {
    [key: string]: any;
    types: {
        data: ProductType[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: Record<string, any>;
}

export function TypeTable({
    onEdit,
    onAddClick,
}: {
    onEdit: (type: ProductType) => void;
    onAddClick: () => void;
}) {
    const { props } = usePage<PageProps>();
    const { types, filters } = props;

    const handleDelete = (type: ProductType) => {
        if (confirm(`Hapus tipe "${type.name}"?`)) {
            router.delete(`/product-types/${type.id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="w-full space-y-4">
            <TypeFilters
                filters={filters || {}}
                totalResults={types?.total || 0}
                onAddClick={onAddClick}
            />

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Nama Tipe</TableHead>
                            <TableHead className="font-bold text-slate-700">Deskripsi</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Jumlah Produk</TableHead>
                            <TableHead className="text-right font-bold text-slate-700 pr-4">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!types?.data?.length ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Layers className="h-8 w-8 opacity-30 text-slate-400" />
                                        <p className="text-xs">Belum ada tipe produk. Tambahkan tipe pertama Anda.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            types.data.map((type) => (
                                <TableRow key={type.id} className="hover:bg-slate-50/50 text-xs">
                                    <TableCell className="font-bold text-slate-800">{type.name}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {type.description || <span className="italic text-slate-400">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold border-0 text-[10px]">
                                            {type.products_count ?? 0} Produk
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-2">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                            onClick={() => onEdit(type)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Tipe</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-650 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDelete(type)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus Tipe</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination 
                data={types as any} 
                itemName="tipe" 
                filters={filters} 
            />
        </div>
    );
}

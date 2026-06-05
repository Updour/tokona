import { usePage, router } from '@inertiajs/react';
import { Edit, Trash, Tag } from 'lucide-react';
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
import { usePermission } from '@/hooks/use-permission';
import { CategoryFilters } from './CategoryFilters';

interface ProductCategory {
    id: string;
    name: string;
    description?: string | null;
    products_count?: number;
}

interface PageProps {
    [key: string]: any;
    categories: {
        data: ProductCategory[];
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: Record<string, any>;
}

export function CategoryTable({
    onEdit,
    onAddClick,
}: {
    onEdit: (category: ProductCategory) => void;
    onAddClick: () => void;
}) {
    const { hasPermission } = usePermission();
    const { props } = usePage<PageProps>();
    const { categories, filters } = props;

    const handleDelete = (cat: ProductCategory) => {
        if (confirm(`Hapus kategori "${cat.name}"?`)) {
            router.delete(`/product-categories/${cat.id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="w-full space-y-4">
            <CategoryFilters
                filters={filters || {}}
                totalResults={categories?.total || 0}
                onAddClick={onAddClick}
            />

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Nama Kategori</TableHead>
                            <TableHead className="font-bold text-slate-700">Deskripsi</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Jumlah Produk</TableHead>
                            <TableHead className="text-right font-bold text-slate-700 pr-4">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!categories?.data?.length ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Tag className="h-8 w-8 opacity-30 text-slate-400" />
                                        <p className="text-xs">Belum ada kategori. Tambahkan kategori pertama Anda.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.data.map((cat) => (
                                <TableRow key={cat.id} className="hover:bg-slate-50/50 text-xs">
                                    <TableCell className="font-bold text-slate-800">{cat.name}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {cat.description || <span className="italic text-slate-400">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold border-0 text-[10px]">
                                            {cat.products_count ?? 0} Produk
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-2">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-end gap-1">
                                                {hasPermission('products.update') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={() => onEdit(cat)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Kategori</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission('products.delete') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(cat)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Hapus Kategori</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4">
                <DataTablePagination 
                    data={categories as any} 
                    itemName="kategori" 
                    filters={filters} 
                />
            </div>
        </div>
    );
}

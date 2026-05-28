import { usePage, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Tag } from 'lucide-react';
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
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Nama Kategori</TableHead>
                            <TableHead className="font-bold text-slate-700">Deskripsi</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Jumlah Produk</TableHead>
                            <TableHead className="w-12" />
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
                                <TableRow key={cat.id} className="hover:bg-slate-50/40 text-xs">
                                    <TableCell className="font-bold text-slate-800">{cat.name}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {cat.description || <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-bold">{cat.products_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(cat)} className="text-xs">
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(cat)}
                                                    className="text-destructive focus:text-destructive text-xs"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
                <span>
                    {categories?.from && categories?.to
                        ? `Menampilkan ${categories.from}–${categories.to} dari ${categories.total.toLocaleString('id-ID')} kategori`
                        : `${categories?.total || 0} data`}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline" size="sm"
                        disabled={!categories?.prev_page_url}
                        onClick={() => categories?.prev_page_url && router.get(categories.prev_page_url)}
                        className="h-8 text-xs"
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        disabled={!categories?.next_page_url}
                        onClick={() => categories?.next_page_url && router.get(categories.next_page_url)}
                        className="h-8 text-xs"
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

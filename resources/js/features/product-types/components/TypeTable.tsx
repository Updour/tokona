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
import { MoreHorizontal, Edit, Trash, Layers } from 'lucide-react';
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
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Nama Tipe</TableHead>
                            <TableHead className="font-bold text-slate-700">Deskripsi</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Jumlah Produk</TableHead>
                            <TableHead className="w-12" />
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
                                <TableRow key={type.id} className="hover:bg-slate-50/40 text-xs">
                                    <TableCell className="font-bold text-slate-800">{type.name}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {type.description || <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-bold">{type.products_count ?? 0}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(type)} className="text-xs">
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(type)}
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
                    {types?.from && types?.to
                        ? `Menampilkan ${types.from}–${types.to} dari ${types.total.toLocaleString('id-ID')} tipe`
                        : `${types?.total || 0} data`}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline" size="sm"
                        disabled={!types?.prev_page_url}
                        onClick={() => types?.prev_page_url && router.get(types.prev_page_url)}
                        className="h-8 text-xs"
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        disabled={!types?.next_page_url}
                        onClick={() => types?.next_page_url && router.get(types.next_page_url)}
                        className="h-8 text-xs"
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

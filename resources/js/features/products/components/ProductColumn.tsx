import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown, Edit, Trash, ImageOff, PackagePlus, Eye, Barcode, Tags, Layers, MapPin, Building2, AlignLeft } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import { useProductStore, type Product } from '@/pages/products/stores/useProductStore';
import { router } from '@inertiajs/react';
import { destroy as productsDestroy } from '@/routes/products';

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value);

const ActionsCell = ({ product }: { product: Product }) => {
    const openForm = useProductStore((state) => state.openForm);
    const openRestock = useProductStore((state) => state.openRestock);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(productsDestroy(product.id).url, {
            preserveScroll: true,
            onSuccess: () => setIsDeleteDialogOpen(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                {/* Detail button */}
                <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Detail Produk</TooltipContent>
                    </Tooltip>

                    <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md p-0 flex flex-col">
                        <SheetHeader className="px-6 py-4 border-b">
                            <SheetTitle className="text-xl">{product.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2">
                                <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="font-mono text-xs">{product.sku || '-'}</span>
                            </SheetDescription>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-6 py-4 space-y-6">
                                {/* Gambar Produk */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><ImageOff className="h-4 w-4" /> Galeri Produk</h4>
                                    {product.images && product.images.length > 0 ? (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {product.images.sort((a, b) => a.sort_order - b.sort_order).map((img, idx) => (
                                                <div key={img.id} className="h-24 w-24 shrink-0 rounded-md border bg-muted overflow-hidden relative">
                                                    <img src={img.url} alt={`Gambar ${idx}`} className="h-full w-full object-cover" />
                                                    {img.is_primary && <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0 border-0 bg-yellow-500">Utama</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-24 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                                            <ImageOff className="h-5 w-5 mb-1 opacity-50" />
                                            <span className="text-xs">Tidak ada gambar</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Informasi Dasar */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Barcode className="h-3.5 w-3.5" /> Barcode</span>
                                        <p className="font-medium font-mono">{product.barcode || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Kategori</span>
                                        <p className="font-medium">{product.category?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Tags className="h-3.5 w-3.5" /> Tipe Produk</span>
                                        <p className="font-medium">{product.type?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Supplier</span>
                                        <p className="font-medium">{product.source || '-'}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Harga & Stok */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-4 rounded-lg border">
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs">Harga Jual</span>
                                        <p className="font-bold text-base text-primary">{formatIDR(Number(product.sell_price))}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs">HPP (Modal)</span>
                                        <p className="font-medium">{formatIDR(Number(product.base_cost))}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs">Sisa Stok</span>
                                        <p className={`font-bold ${Number(product.current_stock) <= 5 ? 'text-destructive' : 'text-green-600'}`}>
                                            {Number(product.current_stock ?? 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground text-xs">Cabang</span>
                                        <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {product.branch?.name || '-'}</p>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                {product.description && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><AlignLeft className="h-4 w-4" /> Deskripsi</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Edit button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                            onClick={() => openForm(product)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Produk</TooltipContent>
                </Tooltip>

                {/* Restock button */}
                {product.track_stock && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                onClick={() => openRestock(product)}
                            >
                                <PackagePlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Tambah Stok</TooltipContent>
                    </Tooltip>
                )}

                {/* Delete with confirmation dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Hapus Produk</TooltipContent>
                    </Tooltip>

                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Hapus Produk</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus produk{' '}
                                <strong className="text-foreground">"{product.name}"</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDelete}
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Produk'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export const columns: ColumnDef<Product>[] = [
    // ── Thumbnail + Nama + SKU ───────────────────────────────────────────────
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="px-0 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Produk
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const product = row.original;
            const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

            return (
                <div className="flex items-center gap-3 min-w-[200px]">
                    {/* Thumbnail */}
                    <div className="h-10 w-10 shrink-0 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                        {primaryImage ? (
                            <img
                                src={primaryImage.url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground/40" />
                        )}
                    </div>
                    {/* Info */}
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm leading-tight">{product.name}</span>
                        {product.sku && (
                            <span className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</span>
                        )}
                        {product.barcode && (
                            <span className="text-xs text-muted-foreground font-mono">Barcode: {product.barcode}</span>
                        )}
                    </div>
                </div>
            );
        },
    },

    // ── Category ────────────────────────────────────────────────────────────
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
            const cat = row.original.category;
            return cat ? (
                <Badge variant="outline" className="text-xs font-normal">
                    {cat.name}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },

    // ── Type ────────────────────────────────────────────────────────────────
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.original.type;
            return type ? (
                <Badge variant="secondary" className="text-xs font-normal">
                    {type.name}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },

    // ── Pricing ─────────────────────────────────────────────────────────────
    {
        accessorKey: 'sell_price',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="px-0 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Price
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{formatIDR(Number(product.sell_price))}</span>
                    {product.base_cost > 0 && (
                        <span className="text-xs text-muted-foreground">
                            Cost: {formatIDR(Number(product.base_cost))}
                        </span>
                    )}
                </div>
            );
        },
    },

    // ── Stock Tracking ──────────────────────────────────────────────────────
    {
        accessorKey: 'current_stock',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="px-0 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Stok
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const { track_stock, allow_negative_stock, current_stock } = row.original;

            if (!track_stock) {
                return <span className="text-xs text-muted-foreground italic">Tidak dilacak</span>;
            }

            const stock = Number(current_stock ?? 0);
            let colorClass = 'text-green-600';
            let label = '';

            if (stock <= 0) {
                colorClass = 'text-destructive font-semibold';
                label = allow_negative_stock ? ' (minus)' : ' (habis)';
            } else if (stock <= 5) {
                colorClass = 'text-amber-600 font-semibold';
                label = ' (menipis)';
            }

            return (
                <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-medium ${colorClass}`}>
                        {stock.toLocaleString('id-ID')}{label}
                    </span>
                    {stock <= 5 && stock > 0 && (
                        <span className="text-xs text-amber-500">Segera restock</span>
                    )}
                    {stock <= 0 && !allow_negative_stock && (
                        <span className="text-xs text-destructive">Tidak bisa dijual</span>
                    )}
                </div>
            );
        },
    },

    // ── Branch ──────────────────────────────────────────────────────────────
    {
        accessorKey: 'branch',
        header: 'Branch',
        cell: ({ row }) => {
            const branch = row.original.branch;
            return branch ? (
                <span className="text-xs text-muted-foreground">
                    {branch.name}
                    {branch.code && <span className="ml-1 font-mono">({branch.code})</span>}
                </span>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },

    // ── Status ──────────────────────────────────────────────────────────────
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            return (
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        },
    },

    // ── Actions ─────────────────────────────────────────────────────────────
    {
        id: 'actions',
        cell: ({ row }) => <ActionsCell product={row.original} />,
    },
];

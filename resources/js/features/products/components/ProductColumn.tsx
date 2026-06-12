import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Edit, Trash, ImageOff, PackagePlus, Eye, Barcode, Tags, Layers, MapPin, Building2, AlignLeft } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductStore  } from '@/pages/products/stores/useProductStore';
import type {Product} from '@/pages/products/stores/useProductStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah, formatNumber } from '@/lib/helpers/format';

const ActionsCell = ({ product }: { product: Product }) => {
    const { openForm, openRestock, openDetail, openDelete } = useProductStore();

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                {/* Detail button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            onClick={() => openDetail(product)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Detail Produk</TooltipContent>
                </Tooltip>

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

                {/* Delete button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => openDelete(product)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Hapus Produk</TooltipContent>
                </Tooltip>
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
                    <span className="font-semibold text-sm">{formatRupiah(Number(product.sell_price))}</span>
                    {product.base_cost > 0 && (
                        <span className="text-xs text-muted-foreground">
                            Cost: {formatRupiah(Number(product.base_cost))}
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
                        {formatNumber(stock)}{label}
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

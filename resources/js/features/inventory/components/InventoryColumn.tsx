import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowDownRight, ArrowUpRight, RefreshCcw, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber } from '@/lib/helpers/format';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button variant="ghost" className="px-0 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Waktu
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{formatDate(date)}</span>
                    <span className="text-xs text-muted-foreground">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'product',
        header: 'Produk',
        cell: ({ row }) => {
            const product = row.original.product;

            if (!product) {
return <span className="text-xs text-muted-foreground">Produk dihapus</span>;
}

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{product.name}</span>
                    {(product.sku || product.barcode) && (
                        <span className="text-xs text-muted-foreground font-mono">
                            {product.sku ? `SKU: ${product.sku}` : `Barcode: ${product.barcode}`}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'branch',
        header: 'Cabang',
        cell: ({ row }) => {
            const branch = row.original.branch;

            return branch ? (
                <span className="text-sm">{branch.name}</span>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },
    {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            
            if (type === 'IN') {
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"><ArrowDownRight className="mr-1 h-3 w-3" /> Masuk</Badge>;
            }

            if (type === 'OUT') {
                return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200"><ArrowUpRight className="mr-1 h-3 w-3" /> Keluar</Badge>;
            }

            if (type === 'RETURN') {
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"><RefreshCcw className="mr-1 h-3 w-3" /> Retur</Badge>;
            }

            if (type === 'ADJUST') {
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><Wrench className="mr-1 h-3 w-3" /> Opname</Badge>;
            }

            return <Badge variant="outline">{type}</Badge>;
        },
    },
    {
        accessorKey: 'qty',
        header: 'Jumlah',
        cell: ({ row }) => {
            const qty = Number(row.original.qty);
            const type = row.original.type;
            
            let colorClass = 'text-foreground';
            let prefix = '';
            
            if (['IN', 'RETURN'].includes(type) || (type === 'ADJUST' && qty > 0)) {
                colorClass = 'text-emerald-600';
                prefix = '+';
            } else if (type === 'OUT' || (type === 'ADJUST' && qty < 0)) {
                colorClass = 'text-rose-600';
                prefix = '-';
            }
            
            return (
                <span className={`font-bold text-base ${colorClass}`}>
                    {prefix}{formatNumber(Math.abs(qty))}
                </span>
            );
        },
    },
    {
        accessorKey: 'notes',
        header: 'Keterangan',
        cell: ({ row }) => {
            const notes = row.original.notes;
            const sourceType = row.original.source_type;

            return (
                <div className="flex flex-col gap-0.5">
                    {notes ? <span className="text-sm">{notes}</span> : <span className="text-muted-foreground text-xs italic">Tanpa catatan</span>}
                    {sourceType && <span className="text-[10px] text-muted-foreground uppercase">{sourceType}</span>}
                </div>
            );
        },
    },
];

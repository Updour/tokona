import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle2, CircleDashed, Wallet, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate, formatRupiah } from '@/lib/helpers/format';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'invoice_number',
        header: 'No. Invoice',
        cell: ({ row }) => {
            const invoice = row.original.invoice_number;
            const id = row.original.id;

            if (invoice) {
                return (
                    <Link
                        href={`/purchases/${id}`}
                        className="font-mono font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                    >
                        {invoice}
                    </Link>
                );
            }

            return <span className="font-mono font-medium text-muted-foreground italic">Draft...</span>;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button variant="ghost" className="px-0 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Tanggal Dibuat
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
        accessorKey: 'branch',
        header: 'Cabang Penerima',
        cell: ({ row }) => {
            return <span className="text-sm font-medium">{row.original.branch?.name || '-'}</span>;
        },
    },
    {
        accessorKey: 'items_count',
        header: 'Jml Item',
        cell: ({ row }) => {
            return <span className="text-sm">{row.original.items_count} Jenis Barang</span>;
        },
    },
    {
        accessorKey: 'total_cost',
        header: 'Total & Sisa Hutang',
        cell: ({ row }) => {
            const total = Number(row.original.total_cost || 0);
            const paid = Number(row.original.amount_paid || 0);
            const remaining = Math.max(0, total - paid);

            return (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-base">{formatRupiah(total)}</span>
                    {remaining > 0 && row.original.status !== 'draft' ? (
                        <span className="text-xs font-semibold text-destructive">Sisa: {formatRupiah(remaining)}</span>
                    ) : null}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status Dokumen',
        cell: ({ row }) => {
            const status = row.original.status as string;
            const paymentStatus = row.original.payment_status as string;

            return (
                <div className="flex flex-col gap-2 items-start">
                    {/* Status Barang */}
                    {status === 'draft' && <Badge variant="outline" className="text-muted-foreground"><CircleDashed className="mr-1 h-3 w-3" /> Draft</Badge>}
                    {status === 'received' && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Diterima Gudang</Badge>}
                    {status === 'paid' && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Dokumen Selesai</Badge>}

                    {/* Status Pembayaran */}
                    {status !== 'draft' && (
                        paymentStatus === 'paid' ? (
                            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px] py-0">LUNAS</Badge>
                        ) : paymentStatus === 'partial' ? (
                            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-[10px] py-0">DICICIL / DP</Badge>
                        ) : (
                            <Badge variant="outline" className="text-destructive border-red-200 bg-red-50 text-[10px] py-0">BELUM DIBAYAR</Badge>
                        )
                    )}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const purchase = row.original;

            const updateStatus = (newStatus: string) => {
                router.put(`/purchases/${purchase.id}/status`, { status: newStatus }, {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Status PO dan mutasi stok berhasil disinkronkan!')
                });
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Ubah Status Cepat</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updateStatus('draft')} disabled={purchase.status === 'draft'}>
                            <CircleDashed className="mr-2 h-4 w-4" /> Kembalikan ke Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus('received')} disabled={purchase.status === 'received'}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Diterima (Masuk Stok)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus('paid')} disabled={purchase.status === 'paid'}>
                            <Wallet className="mr-2 h-4 w-4" /> Tandai Lunas
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

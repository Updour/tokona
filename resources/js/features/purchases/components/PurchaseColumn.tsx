import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CheckCircle2, CircleDashed, Wallet, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link, router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
                    <span className="font-medium text-sm">{date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
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
        header: 'Total Tagihan',
        cell: ({ row }) => {
            const total = Number(row.original.total_cost || 0);
            return <span className="font-bold text-base">Rp {total.toLocaleString('id-ID')}</span>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status as string;
            
            if (status === 'draft') {
                return <Badge variant="outline" className="text-muted-foreground"><CircleDashed className="mr-1 h-3 w-3" /> Draft</Badge>;
            }
            if (status === 'received') {
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Diterima (Belum Lunas)</Badge>;
            }
            if (status === 'paid') {
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"><Wallet className="mr-1 h-3 w-3" /> Lunas</Badge>;
            }
            return <Badge>{status}</Badge>;
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

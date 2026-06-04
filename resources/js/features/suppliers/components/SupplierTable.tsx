import { usePage, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/helpers/format';
import { SupplierFilters } from './SupplierFilters';

export function SupplierTable({ onEdit, onAddClick }: { onEdit: (supplier: any) => void; onAddClick: () => void }) {
    const { props } = usePage<any>();
    const { suppliers, filters } = props;

    const destroy = (id: string) => {
        if (confirm('Yakin ingin menghapus supplier ini?')) {
            router.delete(`/suppliers/${id}`);
        }
    };

    return (
        <div className="w-full space-y-4 bg-white p-4 rounded-lg border shadow-sm">
            <SupplierFilters 
                filters={filters || {}} 
                totalResults={suppliers?.total || 0} 
                onAddClick={onAddClick}
            />

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Nama Supplier</TableHead>
                            <TableHead className="font-bold text-slate-700">Kontak Person</TableHead>
                            <TableHead className="font-bold text-slate-700">No. HP</TableHead>
                            <TableHead className="font-bold text-slate-700">Alamat</TableHead>
                            <TableHead className="font-bold text-slate-700">Tanggal Daftar</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-700 pr-4">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers?.data?.length ? (
                            suppliers.data.map((s: any) => (
                                <TableRow key={s.id} className="hover:bg-slate-50/50 text-xs">
                                    <TableCell>
                                        <Link href={`/suppliers/${s.id}`} className="font-bold text-slate-800 hover:text-primary hover:underline">
                                            {s.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{s.contact_person || '-'}</TableCell>
                                    <TableCell className="font-mono text-slate-600">{s.phone || '-'}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-slate-500">{s.address || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-xs">{formatDate(s.created_at)}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border-0 font-extrabold text-[10px] ${s.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                            {s.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-2">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50" onClick={() => onEdit(s)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Supplier</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => destroy(s.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus Supplier</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    Belum ada data supplier.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <DataTablePagination 
                data={suppliers as any} 
                itemName="supplier" 
                filters={filters} 
            />
        </div>
    );
}

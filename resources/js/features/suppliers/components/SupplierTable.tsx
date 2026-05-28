import { usePage, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
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
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Nama Supplier</TableHead>
                            <TableHead>Kontak Person</TableHead>
                            <TableHead>No. HP</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Tanggal Daftar</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers?.data?.length ? (
                            suppliers.data.map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <Link href={`/suppliers/${s.id}`} className="font-semibold text-primary hover:underline">
                                            {s.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{s.contact_person || '-'}</TableCell>
                                    <TableCell>{s.phone || '-'}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{s.address || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm">{new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                                            {s.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onEdit(s)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => destroy(s.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
            
            <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-muted-foreground">Menampilkan {suppliers?.total ?? 0} data</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!suppliers?.prev_page_url} onClick={() => router.get(suppliers.prev_page_url)}>Prev</Button>
                    <Button variant="outline" size="sm" disabled={!suppliers?.next_page_url} onClick={() => router.get(suppliers.next_page_url)}>Next</Button>
                </div>
            </div>
        </div>
    );
}

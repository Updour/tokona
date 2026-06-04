import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ClipboardList, Plus, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/layouts/app/app-main-layout';
import OpnameDialog from './components/OpnameDialog';

export default function OpnameIndex({ opnames, products, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <MainLayout>
            <Head title="Audit Stok (Opname)" />

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-indigo-600" />
                        Audit Stok (Opname)
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Catat dan sesuaikan selisih stok fisik gudang dengan sistem secara periodik.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm h-10 px-4 rounded-xl font-bold"
                    >
                        <Plus className="mr-2 w-4 h-4" /> Mulai Opname
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-4 mb-5 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari No Referensi..." 
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold py-4">Tanggal</TableHead>
                                <TableHead className="font-bold py-4">No Referensi</TableHead>
                                <TableHead className="font-bold py-4">Auditor</TableHead>
                                <TableHead className="font-bold py-4 text-center">Jml Item</TableHead>
                                <TableHead className="font-bold py-4">Catatan</TableHead>
                                <TableHead className="font-bold py-4">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {opnames?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                        Belum ada riwayat Stock Opname.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                opnames?.data?.map((opname: any) => (
                                    <TableRow key={opname.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">{new Date(opname.opname_date).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="font-bold text-indigo-650">{opname.reference_number}</TableCell>
                                        <TableCell>{opname.creator?.name}</TableCell>
                                        <TableCell className="text-center font-bold text-slate-600">{opname.items?.length || 0}</TableCell>
                                        <TableCell className="text-slate-500 max-w-[200px] truncate" title={opname.notes}>{opname.notes || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                                <CheckCircle2 className="h-3 w-3" /> Selesai
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <OpnameDialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                products={products} 
            />
        </MainLayout>
    );
}

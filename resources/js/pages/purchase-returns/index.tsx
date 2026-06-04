import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Index({ returns, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e: any) => {
        if (e.key === 'Enter') {
            router.get('/purchase-returns', { search }, { preserveState: true });
        }
    };

    return (
        <MainLayout>
            <Head title="Retur Pembelian (Purchase Returns)" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                        <RotateCcw className="h-6 w-6" /> Retur Pembelian
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola data pengembalian barang ke Supplier dan lacak pengembalian dana.
                    </p>
                </div>
                <Button className="shrink-0 bg-red-600 hover:bg-red-700 text-white" asChild>
                    <Link href="/purchase-returns/create">
                        <Plus className="mr-2 h-4 w-4" /> Buat Retur Baru
                    </Link>
                </Button>
            </div>

            <div className="flex-1 bg-background rounded-xl border shadow-sm p-4 w-full">
                <div className="flex gap-3 mb-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari Nomor Retur... (Tekan Enter)" 
                            className="pl-8" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead>Tanggal Retur</TableHead>
                                <TableHead>No. Dokumen</TableHead>
                                <TableHead>Cabang Asal</TableHead>
                                <TableHead>Supplier Tujuan</TableHead>
                                <TableHead className="text-right">Total Nilai</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {returns?.data?.length ? (
                                returns.data.map((ret: any) => (
                                    <TableRow key={ret.id} className="hover:bg-red-50/30">
                                        <TableCell>
                                            {new Date(ret.return_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono font-bold text-red-600">{ret.return_number}</span>
                                        </TableCell>
                                        <TableCell>{ret.branch?.name || '-'}</TableCell>
                                        <TableCell className="font-medium">{ret.supplier?.name || '-'}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            Rp {Number(ret.total_amount).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                                Dikembalikan
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Belum ada data retur pembelian.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" disabled={!returns?.prev_page_url} onClick={() => returns?.prev_page_url && router.get(returns.prev_page_url)}>Sebelumnya</Button>
                    <Button variant="outline" size="sm" disabled={!returns?.next_page_url} onClick={() => returns?.next_page_url && router.get(returns.next_page_url)}>Berikutnya</Button>
                </div>
            </div>
        </MainLayout>
    );
}

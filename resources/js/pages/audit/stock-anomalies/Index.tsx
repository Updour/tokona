import { Head } from '@inertiajs/react';
import { ShieldAlert, AlertTriangle, ArrowRightLeft, FileQuestion, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/helpers/format';
import MainLayout from '@/layouts/app/app-main-layout';
import { useStockAuditStore } from './stores/useStockAuditStore';

export default function StockAuditIndex({ negativeStock = [], mismatchedTransfers = [], unmatchedProducts = [] }: any) {
    const { isResolving, activeTab, setActiveTab, resolveNegativeStock, resolveTransferMismatch } = useStockAuditStore();

    return (
        <MainLayout>
            <Head title="Audit Stok & Integritas Data" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-indigo-600" /> Audit Integritas & Anomali Stok
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Deteksi dini human error: Temukan kebocoran stok, selisih transfer cabang, dan kesalahan entri data mutasi secara otomatis.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-red-100 shadow-sm border-l-4 border-l-red-500 bg-red-50/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                Stok Fisik Negatif
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-800">{negativeStock.length}</div>
                            <p className="text-slate-500 text-[10px] font-medium mt-1">
                                Produk dengan sisa stok kurang dari nol. Sangat kritis untuk diselaraskan.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 shadow-sm border-l-4 border-l-amber-500 bg-amber-50/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                                Selisih Transfer Cabang
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-800">{mismatchedTransfers.length}</div>
                            <p className="text-slate-500 text-[10px] font-medium mt-1">
                                Pengiriman yang statusnya selesai/parsial tetapi jumlah kirim tidak sama dengan terima.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 shadow-sm border-l-4 border-l-blue-500 bg-blue-50/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                <FileQuestion className="w-4 h-4 text-blue-500" />
                                Entri Mutasi Kosong
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-800">{unmatchedProducts.length}</div>
                            <p className="text-slate-500 text-[10px] font-medium mt-1">
                                Produk aktif dengan opsi 'lacak stok' menyala tetapi belum memiliki kartu stok awal.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigasi */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('negative_stock')}
                        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'negative_stock' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Stok Negatif ({negativeStock.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer_mismatch')}
                        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'transfer_mismatch' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Selisih Transfer ({mismatchedTransfers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('unmatched_products')}
                        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'unmatched_products' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Mutasi Kosong ({unmatchedProducts.length})
                    </button>
                </div>

                {/* Render Masing-Masing Sub-Komponen */}
                {activeTab === 'negative_stock' && (
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800">Daftar Produk Stok Negatif</CardTitle>
                            <CardDescription className="text-xs">
                                Stok negatif menandakan ada barang yang terjual sebelum stok dimasukkan atau terjadi kelalaian pencatatan opname.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-md border bg-white mx-4 mb-4">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-700 text-xs">Produk</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs">Cabang</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs text-right">Stok Saat Ini</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs text-right pr-6">Aksi Re-Align</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {negativeStock.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-emerald-600 text-xs font-medium">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
                                                        Hebat! Tidak ada produk dengan stok negatif saat ini.
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            negativeStock.map((prod: any) => (
                                                <TableRow key={prod.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-xs font-semibold text-slate-800">
                                                        {prod.name}
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{prod.sku}</div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-600">
                                                        {prod.branch?.name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-black text-red-600 text-right">
                                                        {formatNumber(prod.current_stock)}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => resolveNegativeStock(prod.id)}
                                                            disabled={isResolving}
                                                            className="h-8 text-[11px] font-bold border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                                                        >
                                                            Setel ke 0
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'transfer_mismatch' && (
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800">Daftar Selisih Transfer Cabang</CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan daftar kiriman barang antar cabang yang telah sampai, namun jumlah barang yang diterima tidak sama dengan yang dikirim.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-md border bg-white mx-4 mb-4">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-700 text-xs">No. Referensi</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs">Rute Cabang</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs">Daftar Barang Selisih</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs text-right pr-6">Aksi Koreksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mismatchedTransfers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-emerald-600 text-xs font-medium">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
                                                        Hebat! Semua data transfer cabang sudah akurat dan seimbang.
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            mismatchedTransfers.map((trf: any) => (
                                                <TableRow key={trf.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-xs font-bold text-slate-800">
                                                        {trf.reference_number}
                                                        <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                            Status: <Badge variant="outline" className="text-[9px] px-1 py-0">{trf.status}</Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-600">
                                                        <span className="font-semibold">{trf.source_branch?.name}</span> 
                                                        <span className="text-slate-400 mx-1">→</span> 
                                                        <span className="font-semibold text-indigo-600">{trf.destination_branch?.name}</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-xs">
                                                        <div className="space-y-1">
                                                            {trf.items?.filter((i: any) => i.shipped_qty !== i.received_qty).map((item: any) => (
                                                                <div key={item.id} className="flex justify-between items-center text-[10px] bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">
                                                                    <span className="font-semibold truncate max-w-[120px]">{item.product?.name}</span>
                                                                    <span className="font-mono text-amber-700">
                                                                        Kirim: {item.shipped_qty} | Terima: <span className="font-bold text-red-600">{item.received_qty}</span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => resolveTransferMismatch(trf.id)}
                                                            disabled={isResolving}
                                                            className="h-8 text-[11px] font-bold border-indigo-200 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700"
                                                        >
                                                            Seleraskan Terima = Kirim
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'unmatched_products' && (
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800">Daftar Produk Tanpa Riwayat Mutasi</CardTitle>
                            <CardDescription className="text-xs">
                                Daftar produk yang diaktifkan pelacakan stoknya tetapi tidak memiliki satupun riwayat mutasi. Sebaiknya lakukan restock awal agar kartu stok terbuat.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-md border bg-white mx-4 mb-4">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-700 text-xs">Produk</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs">Cabang</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs">SKU</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-xs text-right pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unmatchedProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-emerald-600 text-xs font-medium">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
                                                        Hebat! Semua produk terdaftar memiliki riwayat mutasi stok.
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            unmatchedProducts.map((prod: any) => (
                                                <TableRow key={prod.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-xs font-semibold text-slate-800">
                                                        {prod.name}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-600">
                                                        {prod.branch?.name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono text-slate-500">
                                                        {prod.sku || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50/40">
                                                            Stok Belum Diinisialisasi
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

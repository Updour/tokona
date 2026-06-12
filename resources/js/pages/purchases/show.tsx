import { formatRupiah } from '@/lib/helpers/format';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, CheckCircle2, CircleDashed, Wallet, Building2, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';

interface Props {
    purchase: any;
}

export default function Show({ purchase }: Props) {
    const renderStatusBadge = (status: string) => {
        if (status === 'draft') {
return <Badge variant="outline" className="text-muted-foreground"><CircleDashed className="mr-1 h-3 w-3" /> Draft (Direncanakan)</Badge>;
}

        if (status === 'received') {
return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Diterima (Belum Lunas)</Badge>;
}

        if (status === 'paid') {
return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"><Wallet className="mr-1 h-3 w-3" /> Lunas</Badge>;
}

        return <Badge>{status}</Badge>;
    };

    return (
        <MainLayout>
            <Head title={`Invoice PO: ${purchase.invoice_number || 'Draft'}`} />

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/purchases"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            Purchase Order {purchase.invoice_number ? `#${purchase.invoice_number}` : '(Draft)'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Rincian detail dokumen pembelian dan surat jalan.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {renderStatusBadge(purchase.status)}
                    <Button variant="secondary" onClick={() => window.print()} className="hidden sm:flex shadow-sm">
                        <Printer className="mr-2 h-4 w-4" /> Cetak Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Paper Document */}
            <div className="mx-auto max-w-5xl">
                <Card className="shadow-lg border-border/50 overflow-hidden bg-white print:shadow-none print:border-none">
                    
                    {/* Top Color Bar */}
                    <div className="h-3 w-full bg-primary" />

                    <CardContent className="p-8 sm:p-12">
                        {/* ─── Identitas ─── */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-muted">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">INVOICE</h2>
                                <div className="text-sm text-slate-500 flex flex-col gap-1">
                                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Tgl Pembelian: <strong className="text-slate-800">{new Date(purchase.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                    <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Status Tagihan: <strong className="text-slate-800 uppercase">{purchase.status}</strong></span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:text-right space-y-1">
                                <span className="text-xs font-semibold text-primary tracking-widest uppercase mb-1">DITERBITKAN UNTUK CABANG:</span>
                                <h3 className="font-bold text-lg text-slate-800">{purchase.branch?.name || '-'}</h3>
                                <p className="text-sm text-slate-500 max-w-[250px] md:ml-auto leading-relaxed">{purchase.branch?.address || 'Alamat cabang belum diatur.'}</p>
                                <p className="text-sm text-slate-500 font-medium mt-1">{purchase.branch?.phone || ''}</p>
                            </div>
                        </div>

                        {/* ─── Supplier Info ─── */}
                        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> DARI SUPPLIER (PEMASOK)</span>
                                {purchase.supplier ? (
                                    <div className="space-y-1 mt-2">
                                        <h4 className="font-bold text-slate-800 text-lg">{purchase.supplier.name}</h4>
                                        <p className="text-sm text-slate-600">{purchase.supplier.address || '-'}</p>
                                        <p className="text-sm text-slate-600 font-medium">{purchase.supplier.phone || '-'}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic mt-2">Tidak ada data pemasok terkait dokumen ini.</p>
                                )}
                            </div>
                            
                            <div className="flex flex-col justify-center items-start md:items-end p-5">
                                <span className="text-sm text-slate-500 mb-1">Total Nilai Transaksi</span>
                                <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{formatRupiah(purchase.total_cost)}</span>
                            </div>
                        </div>

                        {/* ─── Tabel Item ─── */}
                        <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-slate-700">Nama Produk / Item</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[120px]">Qty</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[200px]">Harga Satuan</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[200px]">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchase.items?.map((item: any) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 text-base">{item.product?.name || 'Produk Dihapus'}</span>
                                                    {item.product?.sku && <span className="text-xs text-slate-500 font-mono">SKU: {item.product.sku}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">{item.qty}</TableCell>
                                            <TableCell className="text-right text-slate-600">{formatRupiah(item.unit_cost)}</TableCell>
                                            <TableCell className="text-right font-bold text-slate-800">{formatRupiah(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* ─── Footer ─── */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                            <p>Dibuat oleh sistem otomatis Tokona pada {new Date(purchase.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                            <p className="font-semibold italic text-slate-400">Terima kasih atas kerja samanya.</p>
                        </div>
                        
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

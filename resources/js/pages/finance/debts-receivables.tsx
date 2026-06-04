import { Head } from '@inertiajs/react';
import { ArrowRightLeft, ArrowDownRight, ArrowUpRight, Scale, Users, Store, Phone, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';
import { formatRupiah, formatDate } from '@/lib/helpers/format';

export default function DebtsReceivables({ stats }: any) {
    const netObligation = stats.total_receivables - stats.total_debts;

    return (
        <MainLayout>
            <Head title="Manajemen Hutang & Piutang Bisnis" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <ArrowRightLeft className="h-6 w-6 text-indigo-600 animate-pulse" /> Hutang & Piutang Bisnis
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kendali likuiditas terpusat. Kelola kewajiban pembayaran belanja stok ke supplier (Hutang) dan sisa tagihan belanja dari pelanggan Anda (Piutang).
                    </p>
                </div>

                {/* Ringkasan Likuiditas 3 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-l-4 border-l-red-500 bg-red-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Hutang Pemasok</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-red-600">
                                {formatRupiah(stats.total_debts)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Tagihan pembelian stok yang belum lunas</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-emerald-50/[0.01]">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Piutang Pelanggan</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-extrabold text-emerald-600">
                                {formatRupiah(stats.total_receivables)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Sisa tagihan belanja yang harus ditagih</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border border-indigo-200 bg-indigo-50/50">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold uppercase text-indigo-700">Selisih Kas Likuid</CardTitle>
                            <Scale className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className={`text-2xl font-black ${netObligation >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                                {netObligation >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netObligation))}
                            </div>
                            <p className="text-xs text-indigo-600 mt-1 font-semibold">
                                {netObligation >= 0 ? 'Piutang Anda menutupi seluruh hutang.' : 'Kewajiban bayar hutang melebihi piutang!'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom Berdampingan: Daftar 10 Besar Hutang vs 10 Besar Piutang */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Sisi Kiri: Piutang Pelanggan */}
                    <Card className="shadow-sm border">
                        <CardHeader className="bg-slate-50/50 p-4 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-emerald-600" /> Top 10 Piutang Pelanggan
                                </CardTitle>
                                <CardDescription className="text-[11px]">Daftar pelanggan dengan tagihan belanja terbesar aktif.</CardDescription>
                            </div>
                            <Badge className="bg-emerald-600">Pelanggan</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pelanggan</TableHead>
                                        <TableHead>Telepon / Kontak</TableHead>
                                        <TableHead className="text-right">Sisa Piutang (Rp)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.receivables?.length ? (
                                        stats.receivables.map((c: any) => (
                                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-semibold text-slate-800">
                                                    <div>{c.name}</div>
                                                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-100 text-slate-500 border">{c.tier}</span>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground flex items-center gap-1 mt-1 border-none">
                                                    <Phone className="h-3 w-3 shrink-0" /> {c.phone || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                                                    {formatRupiah(c.debt_balance)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                Belum ada piutang pelanggan aktif.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Sisi Kanan: Hutang Supplier */}
                    <Card className="shadow-sm border">
                        <CardHeader className="bg-slate-50/50 p-4 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    <Store className="h-4 w-4 text-red-600" /> Top 10 Hutang Pemasok
                                </CardTitle>
                                <CardDescription className="text-[11px]">Daftar faktur pembelian stok ke supplier yang belum dilunasi.</CardDescription>
                            </div>
                            <Badge className="bg-red-600">Supplier</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Faktur / Tanggal</TableHead>
                                        <TableHead className="text-right">Sisa Hutang (Rp)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.debts?.length ? (
                                        stats.debts.map((d: any) => (
                                            <TableRow key={d.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-semibold text-slate-800">
                                                    {d.supplier?.name || 'Umum'}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div className="font-mono">{d.invoice_number}</div>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {formatDate(d.purchase_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-bold text-red-600">
                                                    {formatRupiah(d.total_cost)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                Belum ada hutang supplier aktif.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}

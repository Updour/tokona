import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, BarChart3, TrendingUp, Landmark, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';

export default function ProfitLoss({ branches, stats }: any) {
    const [year, setYear] = useState(String(stats.year || new Date().getFullYear()));
    const [branchId, setBranchId] = useState(stats.branch_id || 'ALL');

    const handleApply = (y = year, br = branchId) => {
        router.get('/profit-loss', {
            year: y,
            branch_id: br !== 'ALL' ? br : undefined
        }, { preserveState: true });
    };

    const grossProfit = stats.revenue - stats.cogs;
    const netProfit = stats.net_profit;
    const years = ['2024', '2025', '2026', '2027'];

    return (
        <MainLayout>
            <Head title="Laporan Laba Rugi Tahunan (Profit & Loss)" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-indigo-600 animate-pulse" /> Laporan Laba Rugi Tahunan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ringkasan profitabilitas terperinci yang menghitung omset pendapatan kotor, HPP (modal barang), serta biaya operasional bulanan Anda.
                        </p>
                    </div>

                    {/* Saringan Laporan */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select value={year} onValueChange={(val) => { setYear(val); handleApply(val, branchId); }}>
                            <SelectTrigger className="w-[100px] h-9 text-xs">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={branchId} onValueChange={(val) => { setBranchId(val); handleApply(year, val); }}>
                            <SelectTrigger className="w-[150px] h-9 text-xs">
                                <SelectValue placeholder="Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Cabang</SelectItem>
                                {branches?.map((b: any) => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Dashboard Profitabilitas 4 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-white">
                        <CardHeader className="p-4 pb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">1. Total Pendapatan</span>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-extrabold text-emerald-600">
                                {formatRupiah(stats.revenue)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-red-500 bg-white">
                        <CardHeader className="p-4 pb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">2. Total Modal Barang (HPP)</span>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-extrabold text-red-600">
                                {formatRupiah(stats.cogs)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-amber-500 bg-white">
                        <CardHeader className="p-4 pb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">3. Biaya Operasional</span>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-extrabold text-amber-600">
                                {formatRupiah(stats.expenses)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border border-indigo-200 bg-indigo-50/50">
                        <CardHeader className="p-4 pb-2">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase">Laba Bersih Akhir</span>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className={`text-xl font-black ${netProfit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                                {formatRupiah(netProfit)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Struktur Laba Rugi Buku Keuangan ERP */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 shadow-sm border">
                        <CardHeader className="bg-slate-50/50 p-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800">Buku Laporan Laba Rugi Tahunan</CardTitle>
                            <CardDescription className="text-xs">Rincian skema laba kotor hingga laba bersih berjalan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 text-sm">
                            <Table>
                                <TableBody>
                                    <TableRow className="bg-emerald-50/10">
                                        <TableCell className="font-bold text-slate-800">PENDAPATAN (OMSET)</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-emerald-600">
                                            {formatRupiah(stats.revenue)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6 text-slate-600">Uang Masuk Kas Utama</TableCell>
                                        <TableCell className="text-right font-mono text-slate-600">
                                            {formatRupiah(stats.revenue)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-red-50/10">
                                        <TableCell className="font-bold text-slate-800">HARGA POKOK PENJUALAN (HPP)</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-red-600">
                                            - {formatRupiah(stats.cogs)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6 text-slate-600">Faktur Pembelian Stok Pemasok</TableCell>
                                        <TableCell className="text-right font-mono text-slate-600">
                                            {formatRupiah(stats.cogs)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-slate-100/50 border-y font-bold">
                                        <TableCell className="text-slate-800 uppercase">LABA KOTOR (GROSS PROFIT)</TableCell>
                                        <TableCell className="text-right font-mono text-slate-800">
                                            {formatRupiah(grossProfit)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-amber-50/10">
                                        <TableCell className="font-bold text-slate-800">BIAYA OPERASIONAL (EXPENSES)</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-amber-600">
                                            - {formatRupiah(stats.expenses)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-6 text-slate-600">Pengeluaran Operasional Terdaftar</TableCell>
                                        <TableCell className="text-right font-mono text-slate-600">
                                            {formatRupiah(stats.expenses)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-indigo-50 border-t font-black text-base">
                                        <TableCell className="text-indigo-800">LABA BERSIH AKHIR (NET PROFIT)</TableCell>
                                        <TableCell className={`text-right font-mono ${netProfit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                                            {formatRupiah(netProfit)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Chart Batang Bulanan Mewah (Kustom CSS Batang) */}
                    <Card className="shadow-sm border">
                        <CardHeader className="bg-slate-50/50 p-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <BarChart3 className="h-4 w-4 text-indigo-600" /> Tren Kinerja Keuangan
                            </CardTitle>
                            <CardDescription className="text-xs">Grafik alokasi Laba Bersih bulanan tahun berjalan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between text-[10px] text-muted-foreground border-b pb-2">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-indigo-500 inline-block" /> Laba Positif</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500 inline-block" /> Laba Defisit</span>
                            </div>

                            {/* Bar Chart Flexbox Layout */}
                            <div className="space-y-2.5 pt-2">
                                {stats.breakdown?.map((m: any) => {
                                    // Cari persentase lebar relatif berdasarkan nilai terbesar
                                    const maxVal = Math.max(...stats.breakdown.map((item: any) => Math.abs(item.net_profit) || 1));
                                    const rawPct = (Math.abs(m.net_profit) / maxVal) * 100;
                                    const barWidth = Math.max(rawPct, 3); // Minimal lebar 3% agar terlihat garis tipis jika nominal sangat kecil

                                    const isPositive = m.net_profit >= 0;

                                    return (
                                        <div key={m.month} className="flex items-center gap-3">
                                            <div className="w-8 text-[10px] font-bold text-slate-600 capitalize text-left shrink-0">{m.month}</div>
                                            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden relative border border-slate-50">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-red-500 hover:bg-red-600'}`}
                                                    style={{ width: `${barWidth}%` }}
                                                />
                                            </div>
                                            <div className="w-20 text-[10px] text-right font-mono font-bold text-slate-700 shrink-0">
                                                {isPositive ? '+' : '-'} {formatRupiah(Math.abs(m.net_profit))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}

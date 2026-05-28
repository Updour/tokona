import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';

interface SalesReportProps {
    salesSummary: {
        total_sales: number;
        total_subtotal: number;
        total_discount: number;
        total_tax: number;
        tx_count: number;
        daily_sales: any[];
        payment_methods: any[];
    };
}

export default function SalesReport({ salesSummary }: SalesReportProps) {
    return (
        <div className="space-y-6">
            {/* Kartu Ringkasan Finansial */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pendapatan Kotor</CardDescription>
                        <CardTitle className="text-xl font-black text-indigo-650">{formatRupiah(salesSummary.total_sales)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500" /> Nilai tagihan bersih faktur terbayar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jumlah Transaksi</CardDescription>
                        <CardTitle className="text-xl font-black text-slate-800">{salesSummary.tx_count} Faktur</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-[10px] text-slate-500 font-semibold">
                            Rata-rata: {salesSummary.tx_count > 0 ? formatRupiah(salesSummary.total_sales / salesSummary.tx_count) : 'Rp 0'} / faktur
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pajak PPN Terkumpul</CardDescription>
                        <CardTitle className="text-xl font-black text-slate-800">{formatRupiah(salesSummary.total_tax)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-[10px] text-slate-500 font-semibold">
                            PPN 11% terhitung dari belanja dasar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diskon Diberikan</CardDescription>
                        <CardTitle className="text-xl font-black text-rose-650">{formatRupiah(salesSummary.total_discount)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-[10px] text-rose-650 font-bold">
                            Pemotongan nilai dari promo aktif
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabel Tren Harian */}
                <Card className="lg:col-span-2 border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-sm font-black text-slate-800">Tren Pendapatan Harian</CardTitle>
                        <CardDescription className="text-xs">Rangkuman transaksi harian berdasarkan rentang filter waktu yang ditentukan.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 text-slate-800">
                        {salesSummary.daily_sales.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                Tidak ada transaksi terbayar dalam rentang tanggal ini.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="h-9 font-bold text-slate-700">Tanggal</TableHead>
                                        <TableHead className="h-9 font-bold text-slate-700 text-center">Jumlah Transaksi</TableHead>
                                        <TableHead className="h-9 font-bold text-slate-700 text-right pr-4">Total Pendapatan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {salesSummary.daily_sales.map((item: any, idx: number) => (
                                        <TableRow key={idx} className="hover:bg-slate-50/40">
                                            <TableCell className="font-mono text-slate-650 font-bold">
                                                {new Date(item.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-slate-800">{item.tx_count} Transaksi</TableCell>
                                            <TableCell className="text-right font-mono font-black text-indigo-650 pr-4">{formatRupiah(parseFloat(item.total_revenue))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Kontribusi Cara Pembayaran */}
                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-sm font-black text-slate-800">Kontribusi Pembayaran</CardTitle>
                        <CardDescription className="text-xs">Persentase cara pelanggan melakukan checkout di mesin kasir.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {salesSummary.payment_methods.length === 0 ? (
                            <div className="text-center text-slate-400 text-xs font-semibold py-8">
                                Belum ada data pembayaran terkumpul.
                            </div>
                        ) : (
                            salesSummary.payment_methods.map((item: any, idx: number) => {
                                const percentage = salesSummary.total_sales > 0 
                                    ? ((item.amount / salesSummary.total_sales) * 100).toFixed(1)
                                    : '0';

                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-800">
                                                <CreditCard className="h-3.5 w-3.5 text-indigo-650" />
                                                <span className="font-bold">{item.label}</span>
                                            </div>
                                            <span className="font-mono font-black text-slate-800">{percentage}% ({item.count} tx)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-650 h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-right font-mono text-slate-500 font-bold">
                                            {formatRupiah(item.amount)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { CreditCard, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface SalesReportProps {
    salesSummary: {
        total_sales: number;
        total_subtotal: number;
        total_discount: number;
        total_tax: number;
        total_cogs: number;
        total_profit: number;
        tx_count: number;
        daily_sales: any;
        all_daily_sales: any[];
        payment_methods: any[];
    };
}

export default function SalesReport({ salesSummary }: SalesReportProps) {
    return (
        <div className="space-y-6">
            {/* Kartu Ringkasan Finansial */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimasi Laba Bersih</CardDescription>
                        <CardTitle className="text-xl font-black text-emerald-650">{formatRupiah(salesSummary.total_profit)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" /> (Pendapatan Kotor - Modal)
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
                    <CardContent className="p-0 text-slate-800 flex flex-col">
                        {/* Grafik Recharts */}
                        {salesSummary.all_daily_sales.length > 0 && (
                            <div className="h-[250px] w-full p-4 pb-0 border-b">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <AreaChart data={salesSummary.all_daily_sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <YAxis 
                                            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`} 
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <RechartsTooltip 
                                            formatter={(value: any) => [formatRupiah(value), 'Pendapatan']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="total_revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {salesSummary.daily_sales.data.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                Tidak ada transaksi terbayar dalam rentang tanggal ini.
                            </div>
                        ) : (
                            <div className="flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="h-9 font-bold text-slate-700">Tanggal</TableHead>
                                            <TableHead className="h-9 font-bold text-slate-700 text-center">Jumlah Transaksi</TableHead>
                                            <TableHead className="h-9 font-bold text-slate-700 text-right pr-4">Total Pendapatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-xs">
                                        {salesSummary.daily_sales.data.map((item: any, idx: number) => (
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
                                <div className="mt-auto">
                                    <DataTablePagination data={salesSummary.daily_sales} itemName="hari" />
                                </div>
                            </div>
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

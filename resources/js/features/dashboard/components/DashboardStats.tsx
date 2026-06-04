import { TrendingUp, Package2, ArrowUpRight, AlertTriangle, BatteryWarning, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/helpers/format';

interface DashboardStatsProps {
    salesSummary: any;
    stockReport: any;
}

export function DashboardStats({ salesSummary, stockReport }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendapatan</CardDescription>
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <CardTitle className="text-2xl font-black text-indigo-700">{formatRupiah(salesSummary.total_sales)}</CardTitle>
                    <div className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {salesSummary.tx_count} transaksi selesai
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Aset Stok</CardDescription>
                    <Package2 className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <CardTitle className="text-2xl font-black text-emerald-700">{formatRupiah(stockReport.cost_valuation)}</CardTitle>
                    <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                        Potensi harga jual: {formatRupiah(stockReport.retail_valuation)}
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-rose-100 shadow-sm bg-gradient-to-br from-rose-50/50 to-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Peringatan Stok</CardDescription>
                    <BatteryWarning className="h-4 w-4 text-rose-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <CardTitle className="text-2xl font-black text-rose-700">{stockReport.out_of_stock + stockReport.low_stock} Produk</CardTitle>
                    <div className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Segera lakukan restock!
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-amber-100 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Variasi SKU</CardDescription>
                    <ShoppingBag className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <CardTitle className="text-2xl font-black text-amber-700">{stockReport.total_items} SKU</CardTitle>
                    <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                        Tersimpan di basis data toko
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

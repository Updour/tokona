import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesMetricsProps {
    stats?: {
        total_sales: number;
        total_visits: number;
        total_orders: number;
    };
}

export function SalesMetrics({ stats }: SalesMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-slate-800">{stats?.total_sales ?? 0} Personel</div>
                    <p className="text-xs text-indigo-600/80 font-semibold mt-1">Status aktif & beroperasi</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Kunjungan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-slate-800">{stats?.total_visits ?? 0} Kali</div>
                    <p className="text-xs text-emerald-600/80 font-semibold mt-1">Kunjungan ke outlet mitra</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pencapaian Order</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-slate-800">{stats?.total_orders ?? 0} Transaksi</div>
                    <p className="text-xs text-amber-600/80 font-semibold mt-1">Order canvas lapangan</p>
                </CardContent>
            </Card>
        </div>
    );
}

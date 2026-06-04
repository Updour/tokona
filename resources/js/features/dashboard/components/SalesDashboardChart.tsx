import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
    dailyVisits: { date: string; visits: number; orders: number }[];
}

export function SalesDashboardChart({ dailyVisits }: Props) {
    const data = dailyVisits.map((d) => ({
        date: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        Kunjungan: d.visits,
        Order: d.orders,
    }));

    return (
        <Card className="col-span-1 lg:col-span-2 border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black text-slate-800">Tren Kunjungan Harian</CardTitle>
                <CardDescription className="text-xs">Jumlah kunjungan vs yang menghasilkan order per hari.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {data.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
                        Belum ada data kunjungan pada periode ini.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
                        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gVisit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gOrder" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="Kunjungan" stroke="#4f46e5" strokeWidth={2} fill="url(#gVisit)" />
                            <Area type="monotone" dataKey="Order" stroke="#10b981" strokeWidth={2} fill="url(#gOrder)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

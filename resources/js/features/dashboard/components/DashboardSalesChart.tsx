import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/helpers/format';

interface DashboardSalesChartProps {
    dailySales: any[];
}

export function DashboardSalesChart({ dailySales }: DashboardSalesChartProps) {
    // Format data for Recharts
    const data = dailySales.map(item => ({
        date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        pos: parseFloat(item.pos_revenue || 0),
        canvas: parseFloat(item.canvas_revenue || 0),
        total: parseFloat(item.total_revenue || 0)
    }));

    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white col-span-1 lg:col-span-3 xl:col-span-2">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-black text-slate-800">Grafik Penjualan POS vs Canvas</CardTitle>
                    <CardDescription className="text-xs">Perbandingan pendapatan kotor harian antara mesin kasir (POS) dan sales lapangan (Canvas).</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs font-semibold">
                        Tidak ada transaksi pada periode ini.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCanvas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                tickFormatter={(val) => `Rp ${val / 1000}k`}
                            />
                            <Tooltip 
                                formatter={(value: any) => [formatRupiah(Number(value))]}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                            />
                            <Legend 
                                verticalAlign="top" 
                                height={36} 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', fontWeight: '500' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="pos" 
                                name="Penjualan POS (Kasir)"
                                stroke="#4f46e5" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPos)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="canvas" 
                                name="Sales Canvas (Lapangan)"
                                stroke="#10b981" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorCanvas)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

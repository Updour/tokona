import { Link } from '@inertiajs/react';
import { User, MapPin, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/helpers/format';

interface DashboardSalesLeaderboardProps {
    leaderboard: any[];
}

export function DashboardSalesLeaderboard({ leaderboard }: DashboardSalesLeaderboardProps) {
    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white col-span-1 lg:col-span-1">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-black text-slate-800">Performa Sales Lapangan</CardTitle>
                    <CardDescription className="text-xs">Peringkat berdasarkan omset penjualan canvas.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {!leaderboard || leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Belum ada data aktivitas sales lapangan.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {leaderboard.map((sales: any, idx: number) => (
                            <Link 
                                href={`/sales`} 
                                key={idx} 
                                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-amber-50 flex items-center justify-center font-black text-amber-700 text-xs group-hover:bg-amber-100 transition-colors">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                            {sales.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-500">
                                                <MapPin className="h-2.5 w-2.5 text-rose-500" />
                                                {sales.visits_count} Kunjungan
                                            </span>
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-500">
                                                <ClipboardList className="h-2.5 w-2.5 text-indigo-500" />
                                                {sales.orders_count} Order
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap ml-4">
                                    <p className="text-xs font-black text-emerald-650">
                                        {formatRupiah(sales.total_revenue)}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                        Omset Lapangan
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

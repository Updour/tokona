import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface SalesFieldReportProps {
    salesFieldReport: {
        total_visits: number;
        ordered_visits: number;
        total_orders: number;
        total_revenue: number;
        conversion_rate: number;
        leaderboard: {
            id: string;
            name: string;
            branch: string;
            visits_count: number;
            orders_count: number;
            total_revenue: number;
            conversion_rate: number;
        }[];
    };
}

const KPI_CARDS = [
    { key: 'total_visits', label: 'Total Kunjungan', color: 'text-indigo-700', format: (v: number) => v.toLocaleString('id-ID') },
    { key: 'total_orders', label: 'Canvas Orders', color: 'text-emerald-700', format: (v: number) => v.toLocaleString('id-ID') },
    { key: 'total_revenue', label: 'Omset Canvas', color: 'text-amber-700', format: formatRupiah },
    { key: 'conversion_rate', label: 'Konversi', color: 'text-rose-700', format: (v: number) => `${v}%` },
] as const;

export default function SalesFieldReport({ salesFieldReport }: SalesFieldReportProps) {
    if (!salesFieldReport) {
return null;
}

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_CARDS.map(({ key, label, color, format }) => (
                    <Card key={key} className="border border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="p-4 pb-1">
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</CardDescription>
                            <CardTitle className={`text-xl font-black ${color}`}>
                                {format(salesFieldReport[key as keyof typeof salesFieldReport] as number)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card className="border border-slate-200/80 shadow-sm bg-white">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-black text-slate-800">Kinerja Individu Sales Lapangan</CardTitle>
                    <CardDescription className="text-xs">Diurutkan berdasarkan omset canvas tertinggi dalam periode yang dipilih.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {!salesFieldReport.leaderboard || salesFieldReport.leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                            Belum ada data aktivitas sales lapangan pada periode ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-black py-3 pl-4 w-8">#</TableHead>
                                        <TableHead className="text-[10px] font-black py-3">Sales Representative</TableHead>
                                        <TableHead className="text-[10px] font-black py-3">Cabang</TableHead>
                                        <TableHead className="text-[10px] font-black py-3 text-center">Kunjungan</TableHead>
                                        <TableHead className="text-[10px] font-black py-3 text-center">Order</TableHead>
                                        <TableHead className="text-[10px] font-black py-3 text-center">Konversi</TableHead>
                                        <TableHead className="text-[10px] font-black py-3 text-right pr-4">Omset Canvas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesFieldReport.leaderboard.map((row, idx) => (
                                        <TableRow key={row.id} className="hover:bg-slate-50/40 text-xs">
                                            <TableCell className="py-3 pl-4 font-black text-slate-400">#{idx + 1}</TableCell>
                                            <TableCell className="py-3 font-bold text-slate-800">{row.name}</TableCell>
                                            <TableCell className="py-3 text-slate-500 font-medium">{row.branch}</TableCell>
                                            <TableCell className="py-3 text-center font-semibold text-slate-700">{row.visits_count}</TableCell>
                                            <TableCell className="py-3 text-center font-semibold text-emerald-700">{row.orders_count}</TableCell>
                                            <TableCell className="py-3 text-center">
                                                <Badge className={`text-[10px] font-black border-0 px-1.5 ${row.conversion_rate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {row.conversion_rate}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 pr-4 text-right font-black text-indigo-700">{formatRupiah(row.total_revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/helpers/format';

interface Row {
    id: string;
    name: string;
    branch: string;
    visits_count: number;
    orders_count: number;
    total_revenue: number;
    conversion_rate: number;
}

interface Props {
    leaderboard: Row[];
}

export function SalesDashboardLeaderboard({ leaderboard }: Props) {
    return (
        <Card className="col-span-1 border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black text-slate-800">Leaderboard Sales</CardTitle>
                <CardDescription className="text-xs">Peringkat berdasarkan omset canvas periode ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Belum ada data aktivitas sales lapangan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-[10px] font-black py-2 pl-4">#</TableHead>
                                    <TableHead className="text-[10px] font-black py-2">Sales</TableHead>
                                    <TableHead className="text-[10px] font-black py-2 text-center">Kunjungan</TableHead>
                                    <TableHead className="text-[10px] font-black py-2 text-center">Konversi</TableHead>
                                    <TableHead className="text-[10px] font-black py-2 text-right pr-4">Omset</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((row, idx) => (
                                    <TableRow key={row.id} className="hover:bg-slate-50/50">
                                        <TableCell className="py-2.5 pl-4">
                                            <span className={`text-xs font-black ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                                                #{idx + 1}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <Link href="/sales" className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1">
                                                {row.name}
                                            </Link>
                                            <p className="text-[10px] text-slate-400 font-medium">{row.branch}</p>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-center text-xs font-semibold text-slate-600">
                                            {row.visits_count}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-center">
                                            <Badge className={`text-[10px] font-black border-0 px-1.5 ${row.conversion_rate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {row.conversion_rate}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 pr-4 text-right text-xs font-black text-emerald-700">
                                            {formatRupiah(row.total_revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

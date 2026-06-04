import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface ProductPerformanceReportProps {
    productPerformance: {
        top_products: any[];
    };
}

export default function ProductPerformanceReport({ productPerformance }: ProductPerformanceReportProps) {
    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black text-slate-800">10 Produk Terlaris (Best Sellers)</CardTitle>
                <CardDescription className="text-xs">
                    Performa produk teratas yang memberikan kontribusi omset dan estimasi keuntungan bersih tertinggi bagi toko Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {productPerformance.top_products.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Belum ada produk yang terjual dalam rentang tanggal terpilih.
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="h-9 font-bold text-slate-700">Nama Barang</TableHead>
                                <TableHead className="h-9 font-bold text-slate-700">SKU / Nomor</TableHead>
                                <TableHead className="h-9 font-bold text-slate-700 text-center">Volume Terjual</TableHead>
                                <TableHead className="h-9 font-bold text-slate-700 text-right">Total Omset Penjualan</TableHead>
                                <TableHead className="h-9 font-bold text-slate-700 text-right pr-4 text-emerald-850">Margin Laba Bersih</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs text-slate-800">
                            {productPerformance.top_products.map((item: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-slate-50/40">
                                    <TableCell className="font-bold">{item.name}</TableCell>
                                    <TableCell className="font-mono text-slate-500">{item.sku}</TableCell>
                                    <TableCell className="text-center font-bold text-slate-700">{item.qty_sold} Pcs</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatRupiah(item.revenue)}</TableCell>
                                    <TableCell className="text-right font-mono font-black text-emerald-650 pr-4">
                                        {formatRupiah(item.profit)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

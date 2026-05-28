import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Layers } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';

interface StockValuationReportProps {
    stockReport: {
        total_items: number;
        out_of_stock: number;
        low_stock: number;
        retail_valuation: number;
        cost_valuation: number;
        low_stock_items: any[];
    };
}

export default function StockValuationReport({ stockReport }: StockValuationReportProps) {
    return (
        <div className="space-y-6">
            {/* KPI Nilai Aset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-indigo-50/20 to-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Harta Harga Jual (Retail Value)</CardDescription>
                        <CardTitle className="text-2xl font-black text-indigo-650">{formatRupiah(stockReport.retail_valuation)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            * Estimasi nominal kotor yang akan diperoleh jika seluruh produk stok fisik gudang habis terjual eceran.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-emerald-50/20 to-white">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Harta Harga Modal (Cost Value)</CardDescription>
                        <CardTitle className="text-2xl font-black text-emerald-700">{formatRupiah(stockReport.cost_valuation)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            * Jumlah uang modal/base cost supplier yang telah ditanamkan ke dalam seluruh barang gudang aktif.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Metrik Stok */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Jumlah Varian SKU</span>
                        <h4 className="text-lg font-black text-slate-800 mt-1">{stockReport.total_items} Produk</h4>
                    </div>
                    <Layers className="h-8 w-8 text-slate-400" />
                </div>

                <div className="bg-red-50/50 p-4 rounded-lg border border-red-200 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-red-700 uppercase">Stok Habis (0 Pcs)</span>
                        <h4 className="text-lg font-black text-red-800 mt-1">{stockReport.out_of_stock} Produk</h4>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>

                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Stok Menipis (≤ 5 Pcs)</span>
                        <h4 className="text-lg font-black text-amber-800 mt-1">{stockReport.low_stock} Produk</h4>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-400" />
                </div>
            </div>

            {/* Tabel Peringatan Kebutuhan Kulaan */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
                <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-black text-slate-800">Peringatan Dini Pengadaan Barang (Restock Needed)</CardTitle>
                        <CardDescription className="text-xs">Segera hubungi supplier untuk mengisi ulang produk-produk yang tersisa kurang dari 5 pcs berikut.</CardDescription>
                    </div>
                    <Badge className="bg-amber-500 text-white font-extrabold text-[10px]">Restock Alert</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {stockReport.low_stock_items.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                            Luar biasa! Tidak ada stok produk yang menipis saat ini.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="h-9 font-bold text-slate-700">Nama Barang</TableHead>
                                    <TableHead className="h-9 font-bold text-slate-700">SKU / Nomor</TableHead>
                                    <TableHead className="h-9 font-bold text-slate-700 text-right">Harga Modal</TableHead>
                                    <TableHead className="h-9 font-bold text-slate-700 text-right">Harga Jual</TableHead>
                                    <TableHead className="h-9 font-bold text-slate-700 text-center pr-4">Stok Fisik</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-xs text-slate-800">
                                {stockReport.low_stock_items.map((item: any, idx: number) => (
                                    <TableRow key={idx} className="hover:bg-slate-50/40">
                                        <TableCell className="font-bold">{item.name}</TableCell>
                                        <TableCell className="font-mono text-slate-500">{item.sku}</TableCell>
                                        <TableCell className="text-right font-mono text-slate-650">{formatRupiah(item.base_cost)}</TableCell>
                                        <TableCell className="text-right font-mono font-bold">{formatRupiah(item.price)}</TableCell>
                                        <TableCell className="text-center pr-4">
                                            <Badge className={`font-black ${item.stock === 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {item.stock} Pcs
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

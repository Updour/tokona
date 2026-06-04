import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/helpers/format';

interface DashboardTopProductsProps {
    topProducts: any[];
}

export function DashboardTopProducts({ topProducts }: DashboardTopProductsProps) {
    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white col-span-1 lg:col-span-2">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-black text-slate-800">10 Produk Terlaris</CardTitle>
                    <CardDescription className="text-xs">Berdasarkan kuantitas terjual pada periode ini.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {topProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Belum ada data penjualan produk.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {topProducts.map((product: any, idx: number) => (
                            <Link 
                                href={`/products?search=${product.sku}`} 
                                key={idx} 
                                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-xs group-hover:bg-indigo-100 transition-colors">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap ml-4">
                                    <p className="text-xs font-black text-emerald-650">{product.qty_sold} Terjual</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatRupiah(product.revenue)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/helpers/format';
import { Receipt, Clock } from 'lucide-react';

interface DashboardRecentTransactionsProps {
    transactions: any[];
}

export function DashboardRecentTransactions({ transactions }: DashboardRecentTransactionsProps) {
    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white col-span-1 lg:col-span-1">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Riwayat Transaksi Terakhir
                    </CardTitle>
                    <CardDescription className="text-xs">Daftar transaksi POS terbaru yang berhasil diproses.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {!transactions || transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Belum ada riwayat transaksi.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {transactions.map((tx: any, idx: number) => (
                            <Link 
                                href={`/pos`} 
                                key={idx} 
                                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <Receipt className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-650 transition-colors">
                                            {tx.invoice_number}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Oleh: {tx.creator}
                                            </span>
                                            <span className="text-[10px] text-slate-400">•</span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {tx.created_at}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap ml-4">
                                    <p className="text-sm font-black text-slate-800">
                                        {formatRupiah(tx.total)}
                                    </p>
                                    <div className="mt-0.5">
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                            tx.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-700' :
                                            tx.payment_method === 'debt' ? 'bg-rose-100 text-rose-700' :
                                            'bg-indigo-100 text-indigo-700'
                                        }`}>
                                            {tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method === 'debt' ? 'Piutang' : 'Transfer'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

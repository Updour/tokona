import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DashboardPaymentMethodsProps {
    paymentMethods: any[];
    totalSales: number;
}

export function DashboardPaymentMethods({ paymentMethods, totalSales }: DashboardPaymentMethodsProps) {
    return (
        <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black text-slate-800">Metode Pembayaran</CardTitle>
                <CardDescription className="text-xs">Distribusi metode pembayaran periode ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {paymentMethods.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs font-semibold py-4">Belum ada transaksi.</div>
                ) : (
                    paymentMethods.map((item: any, idx: number) => {
                        const percentage = totalSales > 0 
                            ? ((item.amount / totalSales) * 100).toFixed(1)
                            : '0';

                        return (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-800">
                                        <CreditCard className="h-3.5 w-3.5 text-indigo-650" />
                                        <span className="font-bold">{item.label}</span>
                                    </div>
                                    <span className="font-mono font-black text-slate-800">{percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-650 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}

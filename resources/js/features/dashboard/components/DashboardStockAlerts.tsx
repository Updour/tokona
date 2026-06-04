import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardStockAlertsProps {
    lowStockItems: any[];
}

export function DashboardStockAlerts({ lowStockItems }: DashboardStockAlertsProps) {
    return (
        <Card className="border border-rose-200/50 shadow-sm bg-white overflow-hidden">
            <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-black text-rose-900">Perlu Restock Segera</h3>
            </div>
            <div className="p-0">
                {lowStockItems.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs font-medium">Stok dalam kondisi aman.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {lowStockItems.slice(0, 5).map((item: any, idx: number) => (
                            <div key={idx} className="p-3 px-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">Sisa: <span className="font-bold text-rose-600">{item.stock} pcs</span></p>
                                </div>
                                <button onClick={() => router.get('/products/restock')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}

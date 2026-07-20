import { router } from '@inertiajs/react';
import { AlertOctagon, Calendar, Eye } from 'lucide-react';
import * as React from 'react';
import { Card } from '@/components/ui/card';

interface ExpiringItem {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    expired_at: string;
    days_left: number;
    status: 'expired' | 'critical' | 'warning';
    unit: string | null;
}

interface DashboardExpiredAlertsProps {
    expiringItems: ExpiringItem[];
}

export function DashboardExpiredAlerts({ expiringItems = [] }: DashboardExpiredAlertsProps) {
    const [filter, setFilter] = React.useState<'all' | 'expired' | 'critical' | 'warning'>('all');

    const filteredItems = React.useMemo(() => {
        if (filter === 'all') return expiringItems;
        return expiringItems.filter(item => item.status === filter);
    }, [expiringItems, filter]);

    const getStatusStyles = (status: 'expired' | 'critical' | 'warning') => {
        switch (status) {
            case 'expired':
                return {
                    bg: 'bg-red-50 text-red-700 border-red-200',
                    text: 'text-red-600',
                    label: 'Expired',
                };
            case 'critical':
                return {
                    bg: 'bg-rose-50 text-rose-700 border-rose-200',
                    text: 'text-rose-600',
                    label: 'Kritis (< 1 Minggu)',
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50 text-amber-700 border-amber-200',
                    text: 'text-amber-600',
                    label: 'Peringatan (< 1 Bulan)',
                };
        }
    };

    return (
        <Card className="border border-amber-200/50 shadow-sm bg-white overflow-hidden">
            <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-black text-amber-900 font-sans">Peringatan Kedaluwarsa</h3>
                </div>
                <div className="flex items-center gap-1">
                    {(['all', 'expired', 'critical', 'warning'] as const).map((t) => {
                        const count = t === 'all' ? expiringItems.length : expiringItems.filter(i => i.status === t).length;
                        if (count === 0 && t !== 'all') return null;

                        const labelMap = {
                            all: 'Semua',
                            expired: 'Expired',
                            critical: 'Kritis',
                            warning: 'Peringatan',
                        };

                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFilter(t)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                    filter === t
                                        ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {labelMap[t]} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="p-0">
                {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                        Tidak ada barang di kategori ini.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                        {filteredItems.map((item) => {
                            const styles = getStatusStyles(item.status);
                            return (
                                <div key={item.id} className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="space-y-1 pr-2">
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                                            <span className="font-mono">Stok: <span className="font-semibold text-slate-700">{item.stock} {item.unit || 'Pcs'}</span></span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 shrink-0" />
                                                <span>{item.expired_at}</span>
                                            </span>
                                            {item.days_left >= 0 ? (
                                                <span className={`font-semibold ${styles.text}`}>{item.days_left} hari lagi</span>
                                            ) : (
                                                <span className="font-semibold text-red-600">Lewat {Math.abs(item.days_left)} hari</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${styles.bg}`}>
                                            {styles.label}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => router.get('/products')} 
                                            className="text-slate-400 hover:text-indigo-600 p-1"
                                            title="Lihat Produk"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
}

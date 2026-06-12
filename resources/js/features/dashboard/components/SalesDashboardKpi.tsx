import { MapPin, ShoppingCart, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah , formatNumber} from '@/lib/helpers/format';

interface Props {
    kpi: {
        total_visits: number;
        ordered_visits: number;
        total_orders: number;
        total_revenue: number;
        conversion_rate: number;
    };
}

const CARDS = [
    {
        key: 'total_visits',
        label: 'Total Kunjungan',
        icon: MapPin,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        format: (v: number) => formatNumber(v),
        sub: (kpi: Props['kpi']) => `${kpi.ordered_visits} berhasil order`,
    },
    {
        key: 'total_orders',
        label: 'Canvas Orders',
        icon: ShoppingCart,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        format: (v: number) => formatNumber(v),
        sub: () => 'Total transaksi lapangan',
    },
    {
        key: 'total_revenue',
        label: 'Omset Canvas',
        icon: TrendingUp,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        format: formatRupiah,
        sub: () => 'Total pendapatan lapangan',
    },
    {
        key: 'conversion_rate',
        label: 'Konversi Order',
        icon: Percent,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        format: (v: number) => `${v}%`,
        sub: () => 'Kunjungan berhasil order',
    },
] as const;

export function SalesDashboardKpi({ kpi }: Props) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CARDS.map(({ key, label, icon: Icon, color, bg, format, sub }) => (
                <Card key={key} className="border border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">{label}</p>
                            <p className="text-xl font-black text-slate-800 mt-0.5">
                                {format(kpi[key] as number)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                {sub(kpi)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

import { 
    AlertTriangle, 
    Sparkles, 
    TrendingDown, 
    Activity, 
    ShieldCheck, 
    ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SmartInsightsReportProps {
    insights: any[];
}

export default function SmartInsightsReport({ insights = [] }: SmartInsightsReportProps) {
    if (!insights || insights.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-800">Belum Ada Data Insight</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
                    AI Smart Insights membutuhkan minimal 30 hari data penjualan untuk memberikan prediksi pergerakan stok yang akurat.
                </p>
            </div>
        );
    }

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'high': return <TrendingDown className="h-5 w-5 text-orange-500" />;
            case 'medium': return <Activity className="h-5 w-5 text-amber-500" />;
            case 'low': return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
            default: return <Sparkles className="h-5 w-5 text-slate-500" />;
        }
    };

    const getUrgencyBadge = (urgency: string, status: string) => {
        switch (urgency) {
            case 'critical': 
                return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">{status}</Badge>;
            case 'high': 
                return <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">{status}</Badge>;
            case 'medium': 
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">{status}</Badge>;
            case 'low': 
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">{status}</Badge>;
            default: 
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-100 mb-4 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        AI-Powered Analytics
                    </div>
                    <h2 className="text-xl font-black mb-2 text-white">Smart Inventory Forecasting</h2>
                    <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                        Sistem AI menganalisis kecepatan penjualan (velocity) produk Anda dalam 30 hari terakhir untuk memprediksi kapan stok akan habis dan merekomendasikan jumlah restock yang optimal.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((item, index) => (
                    <Card key={index} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <div className="mt-0.5">
                                    {getUrgencyIcon(item.urgency)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight">
                                        {item.name}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                                        SKU: {item.sku}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            {getUrgencyBadge(item.urgency, item.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Stok Saat Ini</span>
                                <span className="font-black text-slate-700 text-sm">{item.current_stock}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Terjual (30h)</span>
                                <span className="font-black text-slate-700 text-sm">{item.total_sold_30d}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Terjual / Hari</span>
                                <span className="font-black text-indigo-600 text-sm">{item.velocity_per_day}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Prediksi Habis</span>
                                <span className={`font-black text-sm ${item.days_remaining <= 7 ? 'text-red-600' : 'text-slate-700'}`}>
                                    {item.days_remaining > 900 ? '> 30' : item.days_remaining} Hari
                                </span>
                            </div>
                        </div>

                        {item.urgency !== 'low' && (
                            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800">
                                <span className="text-xs font-bold flex items-center gap-1.5">
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    Rekomendasi Restock:
                                </span>
                                <span className="text-sm font-black bg-white px-2 py-0.5 rounded shadow-sm">
                                    {item.recommended_restock} item
                                </span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

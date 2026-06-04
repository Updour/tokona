import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CanvasMobileHeader({ sales, todayVisitsCount }: { sales: any, todayVisitsCount: number }) {
    return (
        <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-300">Halo, Semangat Pagi!</p>
                    <h1 className="text-xl font-black">{sales?.name}</h1>
                </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                <p className="text-xs font-semibold text-slate-300 mb-1">Target Hari Ini</p>
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-black">{todayVisitsCount || 0} / 15 Toko</span>
                    <Badge className="bg-white text-slate-900 text-[10px] hover:bg-white border-0 font-bold">
                        Berjalan
                    </Badge>
                </div>
            </div>
        </div>
    );
}

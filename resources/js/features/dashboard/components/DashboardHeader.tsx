import { router } from '@inertiajs/react';
import { LayoutDashboard, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardHeaderProps {
    branches: any[];
    branchId: string;
    setBranchId: (val: string) => void;
    period: string;
    setPeriod: (val: string) => void;
}

export function DashboardHeader({ branches, branchId, setBranchId, period, setPeriod }: DashboardHeaderProps) {
    const applyPeriod = (selectedPeriod: string, selectedBranch: string) => {
        let start = '';
        const end = new Date().toISOString().split('T')[0];
        const today = new Date();
        
        if (selectedPeriod === 'today') {
            start = end;
        } else if (selectedPeriod === 'this_week') {
            const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
            start = firstDay.toISOString().split('T')[0];
        } else if (selectedPeriod === 'this_month') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            start = firstDay.toISOString().split('T')[0];
        } else if (selectedPeriod === 'this_year') {
            const firstDay = new Date(today.getFullYear(), 0, 1);
            start = firstDay.toISOString().split('T')[0];
        }

        router.get('/dashboard', {
            start_date: start,
            end_date: end,
            branch_id: selectedBranch !== 'ALL' ? selectedBranch : undefined,
        }, { preserveState: true });
    };

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                    <LayoutDashboard className="h-6 w-6 text-indigo-650" /> Dashboard Utama
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Ringkasan performa bisnis dan operasional toko Anda saat ini.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Select value={period} onValueChange={(val) => {
 setPeriod(val); applyPeriod(val, branchId); 
}}>
                    <SelectTrigger className="w-[150px] h-9 text-xs shadow-sm bg-white border-slate-200">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <SelectValue placeholder="Periode" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="this_week">Minggu Ini</SelectItem>
                        <SelectItem value="this_month">Bulan Ini</SelectItem>
                        <SelectItem value="this_year">Tahun Ini</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={branchId} onValueChange={(val) => {
 setBranchId(val); applyPeriod(period, val); 
}}>
                    <SelectTrigger className="w-[160px] h-9 text-xs shadow-sm bg-white border-slate-200">
                        <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Cabang</SelectItem>
                        {branches?.map((b: any) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

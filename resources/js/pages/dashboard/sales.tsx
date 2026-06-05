import { Head, router } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalesDashboardChart } from '@/features/dashboard/components/SalesDashboardChart';
import { SalesDashboardKpi } from '@/features/dashboard/components/SalesDashboardKpi';
import { SalesDashboardLeaderboard } from '@/features/dashboard/components/SalesDashboardLeaderboard';
import MainLayout from '@/layouts/app/app-main-layout';

export default function SalesDashboard({ branches, filters, kpi, daily_visits, leaderboard }: any) {
    const [branchId, setBranchId] = useState(filters?.branchId || 'ALL');

    const handleBranchChange = (val: string) => {
        setBranchId(val);
        router.get('/dashboard/sales', { branch_id: val }, { preserveState: true, replace: true });
    };

    return (
        <MainLayout>
            <Head title="Dashboard Sales Lapangan" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                        Dashboard Sales Lapangan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pantau kinerja tim sales canvas secara real-time per periode.
                    </p>
                </div>

                {branches?.length > 0 && (
                    <Select value={branchId} onValueChange={handleBranchChange}>
                        <SelectTrigger className="w-[200px] text-xs font-semibold">
                            <SelectValue placeholder="Semua Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="text-xs">Semua Cabang</SelectItem>
                            {branches.map((b: any) => (
                                <SelectItem key={b.id} value={b.id} className="text-xs font-semibold">{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* KPI Cards */}
            <SalesDashboardKpi kpi={kpi} />

            {/* Chart + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SalesDashboardChart dailyVisits={daily_visits || []} />
                <SalesDashboardLeaderboard leaderboard={leaderboard || []} />
            </div>
        </MainLayout>
    );
}

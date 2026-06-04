import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardPaymentMethods } from '@/features/dashboard/components/DashboardPaymentMethods';
import { DashboardSalesChart } from '@/features/dashboard/components/DashboardSalesChart';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { DashboardStockAlerts } from '@/features/dashboard/components/DashboardStockAlerts';
import { DashboardTopProducts } from '@/features/dashboard/components/DashboardTopProducts';
import { DashboardSalesLeaderboard } from '@/features/dashboard/components/DashboardSalesLeaderboard';
import { DashboardAttendanceSummary } from '@/features/dashboard/components/DashboardAttendanceSummary';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Dashboard({ branches, filters, salesSummary, productPerformance, stockReport, salesFieldReport, attendanceReport }: any) {
    const [branchId, setBranchId] = useState(filters.branch_id || 'ALL');
    const [period, setPeriod] = useState('this_month');

    return (
        <MainLayout>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <DashboardHeader 
                    branches={branches} branchId={branchId} setBranchId={setBranchId} 
                    period={period} setPeriod={setPeriod} 
                />
                
                <DashboardStats salesSummary={salesSummary} stockReport={stockReport} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardSalesChart dailySales={salesSummary.all_daily_sales} />
                    <div className="space-y-6">
                        {attendanceReport && (
                            <DashboardAttendanceSummary attendanceReport={attendanceReport} />
                        )}
                        <DashboardPaymentMethods paymentMethods={salesSummary.payment_methods} totalSales={salesSummary.total_sales} />
                        <DashboardStockAlerts lowStockItems={stockReport.low_stock_items} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <DashboardTopProducts topProducts={productPerformance.top_products} />
                    <DashboardSalesLeaderboard leaderboard={salesFieldReport?.leaderboard || []} />
                </div>
            </div>
        </MainLayout>
    );
}

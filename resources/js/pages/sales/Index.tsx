import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { SalesMetrics } from '@/features/sales/components/SalesMetrics';
import { SalesTable } from '@/features/sales/components/SalesTable';

interface SalesIndexProps {
    sales: {
        data: any[];
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        current_page: number;
        last_page: number;
    };
    branches: any[];
    products: any[];
    stats: {
        total_sales: number;
        total_visits: number;
        total_orders: number;
    };
    filters: any;
}

export default function SalesIndex({ sales, stats, branches = [], products = [], filters }: SalesIndexProps) {
    return (
        <MainLayout>
            <Head title="Manajemen Sales Lapangan" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-6 w-6 text-indigo-650" />
                    Manajemen Sales Lapangan
                </h1>
                <p className="text-sm text-muted-foreground">
                    Kelola data personel sales representative lapangan Anda secara terintegrasi.
                </p>
            </div>

            <SalesMetrics stats={stats} />
            <SalesTable 
                sales={sales as any} 
                branches={branches} 
                products={products} 
                filters={filters} 
            />
        </MainLayout>
    );
}

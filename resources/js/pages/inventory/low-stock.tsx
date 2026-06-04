import { Head } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { LowStockTable } from '@/features/inventory/components/LowStockTable';

export default function LowStockPage({ products, filters }: { products: any; filters: any }) {
    return (
        <MainLayout>
            <Head title="Stok Kritis" />
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
                    Produk Stok Kritis
                </h1>
                <p className="text-sm text-muted-foreground">
                    Daftar produk yang stoknya berada di bawah batas minimum. Segera lakukan restock.
                </p>
            </div>
            
            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-4">
                <LowStockTable products={products} filters={filters} />
            </div>
        </MainLayout>
    );
}

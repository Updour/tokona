import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Index() {
    return (
        <MainLayout>
            <Head title="Pembelian (Purchases)" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Pembelian</h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola data belanja barang masuk dari supplier ke cabang Anda.
                    </p>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <PurchaseTable onAddClick={() => router.get('/purchases/create')} />
            </div>
        </MainLayout>
    );
}

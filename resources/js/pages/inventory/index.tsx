import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { InventoryTable } from '@/features/inventory/components/InventoryTable';

export default function Index() {
    return (
        <MainLayout>
            <Head title="Inventory & Stock Movement" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Riwayat Stok</h1>
                <p className="text-sm text-muted-foreground">
                    Pantau pergerakan stok barang masuk, keluar, retur, dan penyesuaian (opname).
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-4">
                <InventoryTable />
            </div>
        </MainLayout>
    );
}

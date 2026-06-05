import { Head } from '@inertiajs/react';
import { ConsignmentDetailDialog } from '@/features/consignments/components/ConsignmentDetailDialog';
import { ConsignmentReceiveDialog } from '@/features/consignments/components/ConsignmentReceiveDialog';
import { ConsignmentSettleDialog } from '@/features/consignments/components/ConsignmentSettleDialog';
import { ConsignmentTable } from '@/features/consignments/components/ConsignmentTable';
import MainLayout from '@/layouts/app/app-main-layout';

export default function ConsignmentsIndex() {

    const breadcrumbs = [
        { title: 'Inventory', href: '#' },
        { title: 'Barang Titipan', href: '#' },
    ];

    return (
        <MainLayout>
            <Head title="Barang Titipan" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Barang Titipan</h1>
                <p className="text-sm text-muted-foreground">
                    Kelola penerimaan, setoran, dan riwayat barang titipan (konsinyasi) dari supplier.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <ConsignmentTable />
            </div>

            <ConsignmentReceiveDialog />
            <ConsignmentSettleDialog />
            <ConsignmentDetailDialog />
        </MainLayout>
    );
}

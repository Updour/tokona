import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { BranchTable } from '@/features/branches/components/BranchTable';

export default function BranchesIndex({ branches, filters }: any) {
    return (
        <MainLayout>
            <Head title="Manajemen Cabang" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Cabang</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Kelola dan pantau seluruh cabang toko Anda, termasuk kantor pusat dan kantor cabang pembantu.
                </p>
            </div>

            <div className="flex-1 w-full min-w-0">
                <div className="w-full rounded-lg border bg-background shadow-sm overflow-hidden p-4">
                    <BranchTable data={branches} filters={filters} />
                </div>
            </div>
        </MainLayout>
    );
}

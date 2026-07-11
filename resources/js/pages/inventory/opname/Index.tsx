import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import OpnameDialog from './components/OpnameDialog';
import OpnameTable from './components/OpnameTable';
import OpnameImportDialog from './components/OpnameImportDialog';
import OpnameDetailSheet from './components/OpnameDetailSheet';
import { useOpnameStore } from './stores/useOpnameStore';

export default function OpnameIndex({ opnames, products, filters }: any) {
    const isImportOpen = useOpnameStore((state) => state.isImportOpen);
    const closeImport = useOpnameStore((state) => state.closeImport);

    return (
        <MainLayout>
            <Head title="Audit Stok (Opname)" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Audit Stok (Opname)</h1>
                <p className="text-sm text-muted-foreground">
                    Catat dan sesuaikan selisih stok fisik gudang dengan sistem secara periodik.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-6">
                <OpnameTable opnames={opnames} filters={filters} />
            </div>

            <OpnameDialog products={products} />
            <OpnameDetailSheet />
            
            <OpnameImportDialog open={isImportOpen} onOpenChange={(open) => !open && closeImport()} />
        </MainLayout>
    );
}

import { Head } from '@inertiajs/react';
import { TypeFormDialog } from '@/features/product-types/components/TypeFormDialog';
import { TypeTable } from '@/features/product-types/components/TypeTable';
import MainLayout from '@/layouts/app/app-main-layout';
import { useTypeStore } from '@/pages/product-types/stores/useTypeStore';

export default function Index() {
    const { openForm } = useTypeStore();

    return (
        <MainLayout>
            <Head title="Tipe Produk" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Tipe Produk</h1>
                <p className="text-sm text-muted-foreground">
                    Klasifikasikan produk berdasarkan tipe (e.g. Barang, Jasa, Paket).
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <TypeTable onEdit={(type) => openForm(type)} onAddClick={() => openForm()} />
            </div>

            <TypeFormDialog />
        </MainLayout>
    );
}

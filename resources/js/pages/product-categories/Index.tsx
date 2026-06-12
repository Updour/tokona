import { Head } from '@inertiajs/react';
import { CategoryFormDialog } from '@/features/product-categories/components/CategoryFormDialog';
import { CategoryTable } from '@/features/product-categories/components/CategoryTable';
import MainLayout from '@/layouts/app/app-main-layout';
import { useCategoryStore } from '@/pages/product-categories/stores/useCategoryStore';

export default function Index() {
    const { openForm } = useCategoryStore();

    return (
        <MainLayout>
            <Head title="Kategori Produk" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Kategori Produk</h1>
                <p className="text-sm text-muted-foreground">
                    Kelompokkan produk berdasarkan kategori untuk memudahkan pencarian.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <CategoryTable onEdit={(cat) => openForm(cat)} onAddClick={() => openForm()} />
            </div>

            <CategoryFormDialog />
        </MainLayout>
    );
}

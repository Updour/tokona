import { Head } from '@inertiajs/react';
import { ProductTable } from '@/features/products/components/ProducTable';
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog';
import { ProductRestockDialog } from '@/features/products/components/ProductRestockDialog';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Index() {
    return (
        <MainLayout>
            <Head title="Produk" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
                <p className="text-sm text-muted-foreground">
                    Kelola inventori, harga, dan pengaturan stok produk Anda.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <ProductTable />
            </div>

            {/* Dialog form tambah/edit produk */}
            <ProductFormDialog />

            {/* Dialog restock / tambah stok manual */}
            <ProductRestockDialog />
        </MainLayout>
    );
}

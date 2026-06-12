import { Head } from '@inertiajs/react';
import { ProductTable } from '@/features/products/components/ProductTable';
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog';
import { ProductRestockDialog } from '@/features/products/components/ProductRestockDialog';
import { ProductDetailSheet } from '@/features/products/components/ProductDetailSheet';
import { ProductDeleteDialog } from '@/features/products/components/ProductDeleteDialog';
import { ProductImportDialog } from '@/features/products/components/ProductImportDialog';
import { useProductStore } from '@/pages/products/stores/useProductStore';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Index({ categories, types, suppliers, branches }: any) {
    const isImportOpen = useProductStore((state) => state.isImportOpen);
    const closeImport = useProductStore((state) => state.closeImport);

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

            {/* Dialog Form Tambah/Edit Produk */}
            <ProductFormDialog />

            {/* Dialog Restock Cepat */}
            <ProductRestockDialog />
            <ProductDetailSheet />
            <ProductDeleteDialog />
            
            {/* Dialog Import Excel */}
            <ProductImportDialog open={isImportOpen} onOpenChange={(open) => !open && closeImport()} />
        </MainLayout>
    );
}

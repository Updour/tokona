import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CategoryFormDialog } from '@/features/product-categories/components/CategoryFormDialog';
import { CategoryTable } from '@/features/product-categories/components/CategoryTable';
import MainLayout from '@/layouts/app/app-main-layout';

interface ProductCategory {
    id: string;
    name: string;
    description?: string | null;
}

export default function Index() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ProductCategory | null>(null);

    const openCreate = () => {
        setSelected(null);
        setIsOpen(true);
    };

    const openEdit = (cat: ProductCategory) => {
        setSelected(cat);
        setIsOpen(true);
    };

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
                <CategoryTable onEdit={openEdit} onAddClick={openCreate} />
            </div>

            <CategoryFormDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                category={selected}
            />
        </MainLayout>
    );
}

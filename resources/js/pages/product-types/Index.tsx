import { Head } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/layouts/app/app-main-layout';
import { TypeTable } from '@/features/product-types/components/TypeTable';
import { TypeFormDialog } from '@/features/product-types/components/TypeFormDialog';

interface ProductType {
    id: string;
    name: string;
    description?: string | null;
}

export default function Index() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ProductType | null>(null);

    const openCreate = () => {
        setSelected(null);
        setIsOpen(true);
    };

    const openEdit = (type: ProductType) => {
        setSelected(type);
        setIsOpen(true);
    };

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
                <TypeTable onEdit={openEdit} onAddClick={openCreate} />
            </div>

            <TypeFormDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                type={selected}
            />
        </MainLayout>
    );
}

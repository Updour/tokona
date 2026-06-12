import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierFormDialog } from '@/features/suppliers/components/SupplierFormDialog';
import { SupplierTable } from '@/features/suppliers/components/SupplierTable';
import MainLayout from '@/layouts/app/app-main-layout';
import { useSupplierStore } from '@/pages/suppliers/stores/useSupplierStore';

export default function Index() {
    const { openForm } = useSupplierStore();

    return (
        <MainLayout>
            <Head title="Data Supplier" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Data Supplier (Pemasok)</h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola daftar perusahaan atau individu yang menjadi pemasok barang toko Anda.
                    </p>
                </div>
            </div>

            <SupplierTable onEdit={(supplier) => openForm(supplier)} onAddClick={() => openForm()} />

            <SupplierFormDialog />
        </MainLayout>
    );
}

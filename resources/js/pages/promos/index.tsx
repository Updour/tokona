import { Head, router } from '@inertiajs/react';
import { Megaphone, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PromoFormDialog } from '@/features/promos/components/PromoFormDialog';
import { PromoDeleteDialog } from '@/features/promos/components/PromoDeleteDialog';
import { PromoTable } from '@/features/promos/components/PromoTable';
import MainLayout from '@/layouts/app/app-main-layout';

import { usePromoStore } from '@/pages/promos/stores/usePromoStore';

export default function Index({ promos }: any) {
    const { openForm } = usePromoStore();

    const handleAdd = () => {
        openForm();
    };

    const handleEdit = (promo: any) => {
        openForm(promo);
    };

    return (
        <MainLayout>
            <Head title="Aturan Diskon & Promo" />
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Megaphone className="h-6 w-6" /> Aturan Diskon & Promo
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Atur promosi otomatis berdasarkan barang, tanggal, atau tier pelanggan Anda.
                        </p>
                    </div>
                </div>

                <PromoTable 
                    promos={promos} 
                    onEdit={handleEdit} 
                    onAddClick={handleAdd}
                />

                <PromoFormDialog />

                <PromoDeleteDialog />
            </div>
        </MainLayout>
    );
}

import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { SupplierTable } from '@/features/suppliers/components/SupplierTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SupplierFormDialog } from '@/features/suppliers/components/SupplierFormDialog';
import { useState } from 'react';

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    const handleEdit = (supplier: any) => {
        setSelectedSupplier(supplier);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedSupplier(null);
        setIsDialogOpen(true);
    };

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

            <SupplierTable onEdit={handleEdit} onAddClick={handleAdd} />

            <SupplierFormDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                supplier={selectedSupplier}
            />
        </MainLayout>
    );
}

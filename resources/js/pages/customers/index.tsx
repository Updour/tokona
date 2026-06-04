import { Head, router } from '@inertiajs/react';
import { Users, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog';
import { CustomerTable } from '@/features/customers/components/CustomerTable';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Index({ customers }: any) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleAdd = () => {
        setSelectedCustomer(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (customer: any) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    return (
        <MainLayout>
            <Head title="Manajemen Pelanggan" />
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Users className="h-6 w-6" /> Daftar Pelanggan (CRM)
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola data pelanggan, member, grosir, dan pantau piutang mereka di sini.
                        </p>
                    </div>
                </div>

                <CustomerTable 
                    customers={customers} 
                    onEdit={handleEdit} 
                    onAddClick={handleAdd} 
                />

                <CustomerFormDialog 
                    open={isDialogOpen} 
                    onOpenChange={setIsDialogOpen} 
                    customer={selectedCustomer} 
                />
            </div>
        </MainLayout>
    );
}

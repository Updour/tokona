import { Head } from '@inertiajs/react';
import { TenantTable } from '@/features/tenants/components/TenantTable';
import MainLayout from '@/layouts/app/app-main-layout';

interface IndexProps {
    tenants: any;
    filters: any;
}

export default function Index({ tenants, filters }: IndexProps) {
    return (
        <MainLayout>
            <Head title="Tenant Management" />

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
                <p className="text-muted-foreground">
                    Manage your tenants, commercial plans, and multi-store subscriptions here.
                </p>
            </div>

            <div className="flex-1 w-full min-w-0">
                <div className="w-full rounded-lg border bg-background shadow-sm overflow-hidden p-4">
                    <TenantTable data={tenants} filters={filters} />
                </div>
            </div>

        </MainLayout >
    );
}

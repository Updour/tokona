import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { UserTable } from '@/features/users/components/UserTable';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { type User, type Role } from './types';

interface IndexProps {
    users: {
        data: User[];
        links: any[];
        meta: any;
    };
    filters: any;
    branches: any[];
    roles: Role[];
    tenants?: any[];
}

export default function Index({ users, filters, branches, roles, tenants = [] }: IndexProps) {
    return (
        <MainLayout>
            <Head title="Manajemen Karyawan" />

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Manajemen Karyawan</h1>
                <p className="text-muted-foreground">
                    Kelola data staf toko, kasir, admin, dan akuntan serta atur penugasan cabang dan hak akses mereka.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-4">
                <UserTable data={users} filters={filters} branches={branches} tenants={tenants} />
            </div>

            <UserFormDialog 
                branches={branches} 
                roles={roles} 
                tenants={tenants} 
            />
        </MainLayout>
    );
}

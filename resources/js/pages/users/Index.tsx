import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { UserDetailSheet } from '@/features/users/components/UserDetailSheet';
import { UserDeleteDialog } from '@/features/users/components/UserDeleteDialog';
import { UserTable } from '@/features/users/components/UserTable';
import MainLayout from '@/layouts/app/app-main-layout';
import type {User, Role} from './types';

interface IndexProps {
    users: any;
    filters: any;
    branches: any[];
    roles: Role[];
    tenants?: any[];
}

export default function Index({ users, filters, branches, roles, tenants = [] }: IndexProps) {
    return (
        <MainLayout>
            <Head title="Manajemen Akun User" />

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Manajemen Akun User
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kelola seluruh akun pengguna di dalam sistem SaaS. Tambahkan klien/owner atau blokir akses mereka.
                    </p>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-4">
                <UserTable data={users} filters={filters} branches={branches} tenants={tenants} />
            </div>

            <UserFormDialog 
                branches={branches} 
                roles={roles} 
                tenants={tenants} 
            />
            <UserDetailSheet />
            <UserDeleteDialog />
        </MainLayout>
    );
}

import { formatRupiah } from '@/lib/helpers/format';
import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Head, router } from '@inertiajs/react';
import {
    Wallet,
} from 'lucide-react';
import SalariesFilter from '@/pages/hris/salaries/components/SalariesFilter';
import SalariesTable from '@/pages/hris/salaries/components/SalariesTable';
import SetSalaryDialog from '@/pages/hris/salaries/components/SetSalaryDialog';

export default function SalariesIndex({ employees, filters, branches, tenants, is_super_admin }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters.branch_id || '',
        tenant_id: filters.tenant_id || '',
    });

    const activeFilterCount = [
        localFilters.branch_id,
        localFilters.tenant_id,
    ].filter(Boolean).length;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 350);
        return () => clearTimeout(handler);
    }, [search]);

    const applyFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            search: search || undefined,
            branch_id: localFilters.branch_id || undefined,
            tenant_id: localFilters.tenant_id || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/hris/salaries', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ branch_id: '', tenant_id: '' });
        router.get('/hris/salaries', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    
    return (
        <MainLayout>
            <Head title="Pengaturan Gaji Karyawan" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" />
                    Pengaturan Gaji Karyawan
                </h1>
                <p className="text-sm text-muted-foreground">
                    Kelola besaran gaji pokok masing-masing karyawan secara dinamis.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full flex flex-col gap-4">

                <SalariesFilter
                    search={search}
                    setSearch={setSearch}
                    localFilters={localFilters}
                    updateLocal={updateLocal}
                    applyFilters={applyFilters}
                    resetFilters={resetFilters}
                    activeFilterCount={activeFilterCount}
                    is_super_admin={is_super_admin}
                    tenants={tenants}
                    branches={branches}
                    total={employees?.total}
                />

                <SalariesTable
                    employees={employees}
                    
                />
            </div>

            <SetSalaryDialog />
        </MainLayout>
    );
}

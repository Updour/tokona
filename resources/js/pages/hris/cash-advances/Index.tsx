import { Head, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogTrigger } from '@/components/ui/dialog';
import { useCashAdvanceStore } from '@/stores/useCashAdvanceStore';
import { CashAdvanceModal } from './components/CashAdvanceModal';
import { CashAdvanceTable } from './components/CashAdvanceTable';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HRIS', href: '#' },
    { title: 'Kasbon Karyawan', href: '/hris/cash-advances' },
];

export default function Index({ cashAdvances, employees, filters }: any) {
    const { searchQuery, setSearchQuery, setAddModalOpen } = useCashAdvanceStore();

    // Initialize search from props
    useEffect(() => {
        if (filters.search !== undefined && filters.search !== searchQuery) {
            setSearchQuery(filters.search || '');
        }
    }, [filters.search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/hris/cash-advances', { search: searchQuery }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kasbon Karyawan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kasbon Karyawan</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pinjaman karyawan yang akan otomatis dipotong saat penggajian.
                        </p>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kasbon
                    </Button>
                </div>

                {/* Modals are placed outside the layout flow */}
                <CashAdvanceModal employees={employees} />

                <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-2 max-w-sm">
                        <Input
                            placeholder="Cari nama karyawan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" variant="secondary" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                {/* Extracted Table Component */}
                <CashAdvanceTable cashAdvances={cashAdvances} />
            </div>
        </AppLayout>
    );
}

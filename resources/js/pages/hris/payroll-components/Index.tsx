import { Head, router } from '@inertiajs/react';
import { Plus, Search, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/layouts/app/app-main-layout';
import { usePayrollComponentStore } from '@/pages/hris/payroll-components/stores/usePayrollComponentStore';
import PayrollComponentTable from '@/pages/hris/payroll-components/components/PayrollComponentTable';
import PayrollComponentFormDialog from '@/pages/hris/payroll-components/components/PayrollComponentFormDialog';
import PayrollComponentDeleteDialog from '@/pages/hris/payroll-components/components/PayrollComponentDeleteDialog';

export default function PayrollComponentsPage({ components, filters }: any) {
    const { openForm } = usePayrollComponentStore();
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'ALL');

    React.useEffect(() => {
        const handler = setTimeout(() => {
            router.get('/hris/payroll-components', {
                search: search,
                type: type !== 'ALL' ? type : undefined,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(handler);
    }, [search, type]);

    return (
        <MainLayout>
            <Head title="Manajemen Komponen Gaji" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Komponen Gaji</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola master data tunjangan dan potongan otomatis untuk slip gaji.
                    </p>
                </div>
                <Button onClick={() => openForm()}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Komponen
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm mb-6">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/10">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari komponen..." 
                            className="pl-9 bg-background" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-[160px] bg-background">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Tipe</SelectItem>
                                    <SelectItem value="allowance">Tunjangan (+)</SelectItem>
                                    <SelectItem value="deduction">Potongan (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <PayrollComponentTable components={components} />
            </div>

            <PayrollComponentFormDialog />
            <PayrollComponentDeleteDialog />
        </MainLayout>
    );
}

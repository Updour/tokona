import { DataTable } from '@/components/shared/DataTable';
import { columns } from './UserColumns';
import { useUserStore } from '@/pages/users/stores/useUserStore';
import { type User } from '@/pages/users/types';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UserTableProps {
    data: any;
    filters: any;
    branches: any[];
    tenants?: any[];
}

export function UserTable({ data, filters, branches, tenants = [] }: UserTableProps) {
    const openForm = useUserStore((state) => state.openForm);
    const [selectedTenant, setSelectedTenant] = useState(filters?.tenant_id || 'ALL');
    const [selectedBranch, setSelectedBranch] = useState(filters?.branch_id || 'ALL');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'ALL');

    return (
        <div className="space-y-4">
            {/* Saringan Karyawan */}
            <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                {tenants.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full sm:w-[220px]">
                        <Label htmlFor="filter-tenant" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Toko / Tenant
                        </Label>
                        <Select value={selectedTenant} onValueChange={(val) => setSelectedTenant(val)}>
                            <SelectTrigger id="filter-tenant" className="w-full bg-background">
                                <SelectValue placeholder="Pilih Toko/Tenant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Toko</SelectItem>
                                {tenants.map((tenant: any) => (
                                    <SelectItem key={tenant.id} value={tenant.id}>
                                        {tenant.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex flex-col gap-1.5 w-full sm:w-[220px]">
                    <Label htmlFor="filter-branch" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Cabang Penugasan
                    </Label>
                    <Select value={selectedBranch} onValueChange={(val) => setSelectedBranch(val)}>
                        <SelectTrigger id="filter-branch" className="w-full bg-background">
                            <SelectValue placeholder="Pilih Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Cabang</SelectItem>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:w-[180px]">
                    <Label htmlFor="filter-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status Karyawan
                    </Label>
                    <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
                        <SelectTrigger id="filter-status" className="w-full bg-background">
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable<User>
                data={data}
                columns={columns}
                filters={filters}
                baseUrl="/users"
                searchPlaceholder="Cari nama, email, atau telepon..."
                exportFileName="tokona_karyawan_export.csv"
                onAddClick={() => openForm()}
                addButtonText="Tambah Karyawan"
                extraParams={{
                    tenant_id: selectedTenant,
                    branch_id: selectedBranch,
                    status: selectedStatus,
                }}
            />
        </div>
    );
}

import { DataTable } from '@/components/shared/DataTable';
import { useTenantStore  } from '@/pages/tenants/stores/useTenantStore';
import type {Tenant} from '@/pages/tenants/stores/useTenantStore';
import { columns } from './TenantColumn';
import { TenantFormDialog } from './TenantFormDialog';
import { TenantViewDialog } from './TenantViewDialog';

interface LaravelPagination<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
}

interface TenantTableProps {
    data: LaravelPagination<Tenant>;
    filters: any;
}

export function TenantTable({ data, filters }: TenantTableProps) {
    const openForm = useTenantStore((state) => state.openForm);

    return (
        <>
            <DataTable<Tenant>
                data={data}
                columns={columns}
                filters={filters}
                baseUrl="/tenants"
                searchPlaceholder="Search tenants..."
                exportFileName="tenants_export.csv"
                onAddClick={() => openForm()}
                addButtonText="Add Tenant"
            />
            <TenantViewDialog />
            <TenantFormDialog />
        </>
    );
}

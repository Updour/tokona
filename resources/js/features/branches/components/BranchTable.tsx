import { DataTable } from '@/components/shared/DataTable';
import { columns } from './BranchColumn';
import { useBranchStore, type Branch } from '@/pages/branches/stores/useBranchStore';
import { BranchFormDialog } from './BranchFormDialog';
import { BranchViewDialog } from './BranchViewDialog';

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

interface BranchTableProps {
    data: LaravelPagination<Branch>;
    filters: any;
}

export function BranchTable({ data, filters }: BranchTableProps) {
    const openForm = useBranchStore((state) => state.openForm);

    return (
        <>
            <DataTable<Branch>
                data={data}
                columns={columns}
                filters={filters}
                baseUrl="/branches"
                searchPlaceholder="Cari cabang berdasarkan nama atau kode..."
                exportFileName="branches_export.csv"
                onAddClick={() => openForm()}
                addButtonText="Tambah Cabang"
            />
            <BranchViewDialog />
            <BranchFormDialog />
        </>
    );
}

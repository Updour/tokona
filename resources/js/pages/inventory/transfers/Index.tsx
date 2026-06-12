import { Head, router } from '@inertiajs/react';
import { ArrowRightLeft, Plus, Search, Truck, CheckCircle2, Clock, PackageOpen, Building2, SlidersHorizontal, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import CreateTransferDialog from './components/CreateTransferDialog';
import ReceiveTransferDialog from './components/ReceiveTransferDialog';
import TransferDetailDialog from './components/TransferDetailDialog';
import { toast } from 'sonner';
import { useTransferStore } from './stores/useTransferStore';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TransferFilter from './components/TransferFilter';
import TransferTable from './components/TransferTable';

export default function BranchTransfersIndex({ transfers, branches, products, filters, tenants, is_super_admin }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const { openCreate } = useTransferStore();
    const [localFilters, setLocalFilters] = useState({
        branch_id: filters?.branch_id || '',
        tenant_id: filters?.tenant_id || '',
        status: filters?.status || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    const activeFilterCount = [
        localFilters.branch_id,
        localFilters.tenant_id,
        localFilters.status,
        localFilters.date_from,
        localFilters.date_to,
    ].filter(Boolean).length;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search !== (filters?.search || '')) {
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
            status: localFilters.status || undefined,
            date_from: localFilters.date_from || undefined,
            date_to: localFilters.date_to || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        router.get('/inventory/transfers', params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setLocalFilters({ branch_id: '', tenant_id: '', status: '', date_from: '', date_to: '' });
        router.get('/inventory/transfers', {}, { preserveState: false, replace: true });
    };

    const updateLocal = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleShip = (transfer: any) => {
        toast(`Apakah Anda yakin ingin mengirim transfer ${transfer.reference_number}? Stok cabang ini akan dikurangi.`, {
            action: {
                label: 'Ya, Kirim',
                onClick: () => {
                    router.put(`/inventory/transfers/${transfer.id}/ship`, {}, {
                        onSuccess: () => toast.success('Transfer berhasil dikirim'),
                        onError: () => toast.error('Gagal mengirim transfer')
                    });
                }
            },
            cancel: { label: 'Batal', onClick: () => {} }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 flex w-fit items-center gap-1"><Clock className="w-3 h-3"/> Draft</Badge>;
            case 'SHIPPED':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 flex w-fit items-center gap-1"><Truck className="w-3 h-3"/> Dikirim</Badge>;
            case 'PARTIAL':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 flex w-fit items-center gap-1"><PackageOpen className="w-3 h-3"/> Sebagian</Badge>;
            case 'RECEIVED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex w-fit items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Diterima</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <MainLayout>
            <Head title="Transfer Antar Cabang" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    Transfer Antar Cabang
                </h1>
                <p className="text-sm text-muted-foreground">
                    Kelola pergerakan barang antar cabang atau gudang dengan mudah.
                </p>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full flex flex-col gap-4">
                
                <TransferFilter 
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
                    total={transfers?.total}
                    onAddTransfer={() => openCreate()}
                />

                <TransferTable 
                    transfers={transfers}
                    handleShip={handleShip}
                />
            </div>

            <CreateTransferDialog 
                branches={branches}
                products={products}
                currentBranchId={transfers?.data?.[0]?.source_branch_id} // Quick fallback, ideally pass current user branch
                is_super_admin={is_super_admin}
            />

            <ReceiveTransferDialog />

            <TransferDetailDialog />
        </MainLayout>
    );
}

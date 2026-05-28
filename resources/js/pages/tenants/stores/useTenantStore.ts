// @/features/tenants/store/useTenantStore.ts

import { create } from 'zustand';
import { type Tenant } from '../types'; // Impor tipe data dari file terpisah

// State murni untuk data Tenant
interface TenantState {
    isFormOpen: boolean;
    isViewOpen: boolean;
    selectedTenant: Tenant | null;
    address: {
        city: string;
        province: string;
        address_text: string;
    }
    selectedRowIds: Record<string, boolean>;
}

// Actions untuk fungsi pengubah data Tenant
interface TenantActions {
    openForm: (tenant?: any) => void;
    openView: (tenant?: any) => void;
    closeForm: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
    closeView: () => void;
}

type TenantStore = TenantState & TenantActions;

const initialValues: TenantState = {
    isFormOpen: false,
    address: {
        city: '',
        province: '',
        address_text: '',
    },
    isViewOpen: false,
    selectedTenant: null,
    selectedRowIds: {},
};

export const useTenantStore = create<TenantStore>((set) => ({
    ...initialValues,

    openForm: (tenant) => set({ isFormOpen: true, selectedTenant: tenant ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedTenant: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
    openView: (tenant) => set({ isViewOpen: true, selectedTenant: tenant }),
    closeView: () => set({ isViewOpen: false, selectedTenant: null }),
}));

export { Tenant };
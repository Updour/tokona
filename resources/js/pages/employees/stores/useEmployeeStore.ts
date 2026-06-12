// @/features/users/store/useUserStore.ts

import { create } from 'zustand';
import type {Employee} from '../types'; // Impor tipe data dari file terpisah

// State murni untuk data
interface EmployeeState {
    isFormOpen: boolean;
    isDetailOpen: boolean;
    isDeleteOpen: boolean;
    selectedEmployee: Employee | null;
    selectedRowIds: Record<string, boolean>;
}

// Actions untuk fungsi pengubah data
interface EmployeeActions {
    openForm: (employee?: Employee) => void;
    closeForm: () => void;
    openDetail: (employee: Employee) => void;
    closeDetail: () => void;
    openDelete: (employee: Employee) => void;
    closeDelete: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type EmployeeStore = EmployeeState & EmployeeActions;

const initialValues: EmployeeState = {
    isFormOpen: false,
    isDetailOpen: false,
    isDeleteOpen: false,
    selectedEmployee: null,
    selectedRowIds: {},
};

export const useEmployeeStore = create<EmployeeStore>((set) => ({
    ...initialValues,

    openForm: (employee) => set({ isFormOpen: true, selectedEmployee: employee ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedEmployee: null }),
    openDetail: (employee) => set({ isDetailOpen: true, selectedEmployee: employee }),
    closeDetail: () => set({ isDetailOpen: false, selectedEmployee: null }),
    openDelete: (employee) => set({ isDeleteOpen: true, selectedEmployee: employee }),
    closeDelete: () => set({ isDeleteOpen: false, selectedEmployee: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
}));
export { Employee };


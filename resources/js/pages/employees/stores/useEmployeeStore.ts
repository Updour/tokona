// @/features/users/store/useUserStore.ts

import { create } from 'zustand';
import type {Employee} from '../types'; // Impor tipe data dari file terpisah

// State murni untuk data
interface EmployeeState {
    isFormOpen: boolean;
    selectedEmployee: Employee | null;
    selectedRowIds: Record<string, boolean>;
}

// Actions untuk fungsi pengubah data
interface EmployeeActions {
    openForm: (employee?: Employee) => void;
    closeForm: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type EmployeeStore = EmployeeState & EmployeeActions;

const initialValues: EmployeeState = {
    isFormOpen: false,
    selectedEmployee: null,
    selectedRowIds: {},
};

export const useEmployeeStore = create<EmployeeStore>((set) => ({
    ...initialValues,

    openForm: (employee) => set({ isFormOpen: true, selectedEmployee: employee ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedEmployee: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
}));
export { Employee };


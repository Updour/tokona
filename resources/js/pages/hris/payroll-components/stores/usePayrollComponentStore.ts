import { create } from 'zustand';

interface PayrollComponentState {
    isFormOpen: boolean;
    isDeleteOpen: boolean;
    selectedComponent: any | null;
    openForm: (component?: any) => void;
    closeForm: () => void;
    openDelete: (component: any) => void;
    closeDelete: () => void;
}

export const usePayrollComponentStore = create<PayrollComponentState>((set) => ({
    isFormOpen: false,
    isDeleteOpen: false,
    selectedComponent: null,
    openForm: (component = null) => set({ isFormOpen: true, selectedComponent: component }),
    closeForm: () => set({ isFormOpen: false, selectedComponent: null }),
    openDelete: (component) => set({ isDeleteOpen: true, selectedComponent: component }),
    closeDelete: () => set({ isDeleteOpen: false, selectedComponent: null }),
}));

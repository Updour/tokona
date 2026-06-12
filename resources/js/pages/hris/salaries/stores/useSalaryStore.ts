import { create } from 'zustand';

interface SalaryState {
    isSetSalaryOpen: boolean;
    selectedEmployee: any | null;

    openSetSalary: (employee: any) => void;
    closeSetSalary: () => void;
}

export const useSalaryStore = create<SalaryState>((set) => ({
    isSetSalaryOpen: false,
    selectedEmployee: null,

    openSetSalary: (employee) => set({ isSetSalaryOpen: true, selectedEmployee: employee }),
    closeSetSalary: () => set({ isSetSalaryOpen: false, selectedEmployee: null }),
}));

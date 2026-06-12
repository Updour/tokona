import { create } from 'zustand';

interface IncomeState {
    isFormOpen: boolean;
    openForm: () => void;
    closeForm: () => void;
}

export const useIncomeStore = create<IncomeState>((set) => ({
    isFormOpen: false,
    openForm: () => set({ isFormOpen: true }),
    closeForm: () => set({ isFormOpen: false }),
}));

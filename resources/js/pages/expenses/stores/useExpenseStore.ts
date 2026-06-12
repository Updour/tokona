import { create } from 'zustand';

interface ExpenseState {
    isFormOpen: boolean;
    selectedExpense: any | null;
    openForm: (expense?: any) => void;
    closeForm: () => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
    isFormOpen: false,
    selectedExpense: null,
    openForm: (expense = null) => set({ isFormOpen: true, selectedExpense: expense }),
    closeForm: () => set({ isFormOpen: false, selectedExpense: null }),
}));

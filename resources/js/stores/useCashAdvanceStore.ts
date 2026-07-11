import { create } from 'zustand';

interface CashAdvanceState {
    isAddModalOpen: boolean;
    searchQuery: string;
    setAddModalOpen: (isOpen: boolean) => void;
    setSearchQuery: (query: string) => void;
}

export const useCashAdvanceStore = create<CashAdvanceState>((set) => ({
    isAddModalOpen: false,
    searchQuery: '',
    setAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}));

import { create } from 'zustand';

interface SystemLogState {
    isFilterOpen: boolean;
    setFilterOpen: (open: boolean) => void;
}

export const useSystemLogStore = create<SystemLogState>((set) => ({
    isFilterOpen: false,
    setFilterOpen: (open) => set({ isFilterOpen: open }),
}));

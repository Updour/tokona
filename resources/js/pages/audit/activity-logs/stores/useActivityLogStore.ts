import { create } from 'zustand';

interface ActivityLogState {
    isFilterOpen: boolean;
    setFilterOpen: (open: boolean) => void;
}

export const useActivityLogStore = create<ActivityLogState>((set) => ({
    isFilterOpen: false,
    setFilterOpen: (open) => set({ isFilterOpen: open }),
}));

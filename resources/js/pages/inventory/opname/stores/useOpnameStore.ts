import { create } from 'zustand';

interface OpnameState {
    isCreateOpen: boolean;
    openCreate: () => void;
    closeCreate: () => void;
}

export const useOpnameStore = create<OpnameState>((set) => ({
    isCreateOpen: false,
    openCreate: () => set({ isCreateOpen: true }),
    closeCreate: () => set({ isCreateOpen: false }),
}));

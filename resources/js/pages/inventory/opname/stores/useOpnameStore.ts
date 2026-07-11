import { create } from 'zustand';

interface OpnameState {
    isCreateOpen: boolean;
    openCreate: () => void;
    closeCreate: () => void;
    
    isImportOpen: boolean;
    openImport: () => void;
    closeImport: () => void;
    
    isDetailOpen: boolean;
    selectedOpname: any | null;
    openDetail: (opname: any) => void;
    closeDetail: () => void;
}

export const useOpnameStore = create<OpnameState>((set) => ({
    isCreateOpen: false,
    openCreate: () => set({ isCreateOpen: true }),
    closeCreate: () => set({ isCreateOpen: false }),
    
    isImportOpen: false,
    openImport: () => set({ isImportOpen: true }),
    closeImport: () => set({ isImportOpen: false }),
    
    isDetailOpen: false,
    selectedOpname: null,
    openDetail: (opname) => set({ isDetailOpen: true, selectedOpname: opname }),
    closeDetail: () => set({ isDetailOpen: false, selectedOpname: null }),
}));

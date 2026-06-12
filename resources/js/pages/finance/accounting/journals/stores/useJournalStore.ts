import { create } from 'zustand';

export type JournalEntryInput = {
    id: string;
    account_id: string;
    debit: number | string;
    credit: number | string;
    description: string;
};

type JournalStore = {
    isFormOpen: boolean;
    isDeleteOpen: boolean;
    selectedJournal: any | null;
    openForm: () => void;
    closeForm: () => void;
    openDelete: (journal: any) => void;
    closeDelete: () => void;
};

export const useJournalStore = create<JournalStore>((set) => ({
    isFormOpen: false,
    isDeleteOpen: false,
    selectedJournal: null,
    openForm: () => set({ isFormOpen: true, selectedJournal: null }),
    closeForm: () => set({ isFormOpen: false, selectedJournal: null }),
    openDelete: (journal) => set({ isDeleteOpen: true, selectedJournal: journal }),
    closeDelete: () => set({ isDeleteOpen: false, selectedJournal: null }),
}));

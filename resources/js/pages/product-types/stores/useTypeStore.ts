import { create } from 'zustand';
import type { ProductType } from '../types';

interface TypeState {
    isFormOpen: boolean;
    isDeleteOpen: boolean;
    selectedType: ProductType | null;
}

interface TypeActions {
    openForm: (type?: ProductType) => void;
    closeForm: () => void;
    openDelete: (type: ProductType) => void;
    closeDelete: () => void;
    resetStore: () => void;
}

type TypeStore = TypeState & TypeActions;

const initialValues: TypeState = {
    isFormOpen: false,
    isDeleteOpen: false,
    selectedType: null,
};

export const useTypeStore = create<TypeStore>((set) => ({
    ...initialValues,

    openForm: (type) => set({ isFormOpen: true, selectedType: type ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedType: null }),
    openDelete: (type) => set({ isDeleteOpen: true, selectedType: type }),
    closeDelete: () => set({ isDeleteOpen: false, selectedType: null }),
    resetStore: () => set(initialValues),
}));

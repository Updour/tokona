import { create } from 'zustand';
import type { ProductType } from '../types';

interface TypeState {
    isFormOpen: boolean;
    selectedType: ProductType | null;
}

interface TypeActions {
    openForm: (type?: ProductType) => void;
    closeForm: () => void;
    resetStore: () => void;
}

type TypeStore = TypeState & TypeActions;

const initialValues: TypeState = {
    isFormOpen: false,
    selectedType: null,
};

export const useTypeStore = create<TypeStore>((set) => ({
    ...initialValues,

    openForm: (type) => set({ isFormOpen: true, selectedType: type ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedType: null }),
    resetStore: () => set(initialValues),
}));

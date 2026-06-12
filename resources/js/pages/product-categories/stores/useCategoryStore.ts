import { create } from 'zustand';
import type { ProductCategory } from '../types';

interface CategoryState {
    isFormOpen: boolean;
    selectedCategory: ProductCategory | null;
}

interface CategoryActions {
    openForm: (category?: ProductCategory) => void;
    closeForm: () => void;
    resetStore: () => void;
}

type CategoryStore = CategoryState & CategoryActions;

const initialValues: CategoryState = {
    isFormOpen: false,
    selectedCategory: null,
};

export const useCategoryStore = create<CategoryStore>((set) => ({
    ...initialValues,

    openForm: (category) => set({ isFormOpen: true, selectedCategory: category ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedCategory: null }),
    resetStore: () => set(initialValues),
}));

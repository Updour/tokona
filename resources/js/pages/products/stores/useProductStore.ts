import { create } from 'zustand';
import type {Product} from '../types';

interface ProductState {
    isFormOpen: boolean;
    isRestockOpen: boolean;
    selectedProduct: Product | null;
    selectedRowIds: Record<string, boolean>;
}

interface ProductActions {
    openForm: (product?: Product) => void;
    closeForm: () => void;
    openRestock: (product: Product) => void;
    closeRestock: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type ProductStore = ProductState & ProductActions;

const initialState: ProductState = {
    isFormOpen: false,
    isRestockOpen: false,
    selectedProduct: null,
    selectedRowIds: {},
};

export const useProductStore = create<ProductStore>((set) => ({
    ...initialState,

    openForm:     (product) => set({ isFormOpen: true, selectedProduct: product ?? null }),
    closeForm:    ()        => set({ isFormOpen: false, selectedProduct: null }),
    openRestock:  (product) => set({ isRestockOpen: true, selectedProduct: product }),
    closeRestock: ()        => set({ isRestockOpen: false, selectedProduct: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore:   ()        => set(initialState),
}));

export type { Product };

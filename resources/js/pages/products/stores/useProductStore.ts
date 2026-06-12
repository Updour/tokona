import { create } from 'zustand';
import type {Product} from '../types';

interface ProductState {
    isFormOpen: boolean;
    isRestockOpen: boolean;
    isDetailOpen: boolean;
    isDeleteOpen: boolean;
    isImportOpen: boolean;
    selectedProduct: Product | null;
    selectedRowIds: Record<string, boolean>;
}

interface ProductActions {
    openForm: (product?: Product) => void;
    closeForm: () => void;
    openRestock: (product: Product) => void;
    closeRestock: () => void;
    openDetail: (product: Product) => void;
    closeDetail: () => void;
    openDelete: (product: Product) => void;
    closeDelete: () => void;
    openImport: () => void;
    closeImport: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type ProductStore = ProductState & ProductActions;

const initialState: ProductState = {
    isFormOpen: false,
    isRestockOpen: false,
    isDetailOpen: false,
    isDeleteOpen: false,
    isImportOpen: false,
    selectedProduct: null,
    selectedRowIds: {},
};

export const useProductStore = create<ProductStore>((set) => ({
    ...initialState,

    openForm:     (product) => set({ isFormOpen: true, selectedProduct: product ?? null }),
    closeForm:    ()        => set({ isFormOpen: false, selectedProduct: null }),
    openRestock:  (product) => set({ isRestockOpen: true, selectedProduct: product }),
    closeRestock: ()        => set({ isRestockOpen: false, selectedProduct: null }),
    openDetail:   (product) => set({ isDetailOpen: true, selectedProduct: product }),
    closeDetail:  ()        => set({ isDetailOpen: false, selectedProduct: null }),
    openDelete:   (product) => set({ isDeleteOpen: true, selectedProduct: product }),
    closeDelete:  ()        => set({ isDeleteOpen: false, selectedProduct: null }),
    openImport:   ()        => set({ isImportOpen: true }),
    closeImport:  ()        => set({ isImportOpen: false }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore:   ()        => set(initialState),
}));

export type { Product };

import { create } from 'zustand';
import type { Supplier } from '../types';

interface SupplierState {
    isFormOpen: boolean;
    selectedSupplier: Supplier | null;
}

interface SupplierActions {
    openForm: (supplier?: Supplier) => void;
    closeForm: () => void;
    resetStore: () => void;
}

type SupplierStore = SupplierState & SupplierActions;

const initialValues: SupplierState = {
    isFormOpen: false,
    selectedSupplier: null,
};

export const useSupplierStore = create<SupplierStore>((set) => ({
    ...initialValues,

    openForm: (supplier) => set({ isFormOpen: true, selectedSupplier: supplier ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedSupplier: null }),
    resetStore: () => set(initialValues),
}));

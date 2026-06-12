import { create } from 'zustand';
import type { Customer } from '../types';

interface CustomerState {
    isFormOpen: boolean;
    isDetailOpen: boolean;
    isDeleteOpen: boolean;
    selectedCustomer: Customer | null;
}

interface CustomerActions {
    openForm: (customer?: Customer) => void;
    closeForm: () => void;
    openDetail: (customer: Customer) => void;
    closeDetail: () => void;
    openDelete: (customer: Customer) => void;
    closeDelete: () => void;
    resetStore: () => void;
}

type CustomerStore = CustomerState & CustomerActions;

const initialValues: CustomerState = {
    isFormOpen: false,
    isDetailOpen: false,
    isDeleteOpen: false,
    selectedCustomer: null,
};

export const useCustomerStore = create<CustomerStore>((set) => ({
    ...initialValues,

    openForm: (customer) => set({ isFormOpen: true, selectedCustomer: customer ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedCustomer: null }),
    openDetail: (customer) => set({ isDetailOpen: true, selectedCustomer: customer }),
    closeDetail: () => set({ isDetailOpen: false, selectedCustomer: null }),
    openDelete: (customer) => set({ isDeleteOpen: true, selectedCustomer: customer }),
    closeDelete: () => set({ isDeleteOpen: false, selectedCustomer: null }),
    resetStore: () => set(initialValues),
}));

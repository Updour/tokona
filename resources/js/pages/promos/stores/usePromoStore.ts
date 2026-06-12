import { create } from 'zustand';

interface PromoState {
    isFormOpen: boolean;
    isDeleteOpen: boolean;
    selectedPromo: any | null;
}

interface PromoActions {
    openForm: (promo?: any) => void;
    closeForm: () => void;
    openDelete: (promo: any) => void;
    closeDelete: () => void;
    resetStore: () => void;
}

type PromoStore = PromoState & PromoActions;

const initialValues: PromoState = {
    isFormOpen: false,
    isDeleteOpen: false,
    selectedPromo: null,
};

export const usePromoStore = create<PromoStore>((set) => ({
    ...initialValues,

    openForm: (promo) => set({ isFormOpen: true, selectedPromo: promo ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedPromo: null }),
    openDelete: (promo) => set({ isDeleteOpen: true, selectedPromo: promo }),
    closeDelete: () => set({ isDeleteOpen: false, selectedPromo: null }),
    resetStore: () => set(initialValues),
}));

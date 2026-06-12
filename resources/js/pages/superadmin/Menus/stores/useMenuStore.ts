import { create } from 'zustand';

interface MenuState {
    isFormOpen: boolean;
    isDeleteOpen: boolean;
    selectedMenu: any | null;
}

interface MenuActions {
    openForm: (menu?: any) => void;
    closeForm: () => void;
    openDelete: (menu: any) => void;
    closeDelete: () => void;
    resetStore: () => void;
}

type MenuStore = MenuState & MenuActions;

const initialValues: MenuState = {
    isFormOpen: false,
    isDeleteOpen: false,
    selectedMenu: null,
};

export const useMenuStore = create<MenuStore>((set) => ({
    ...initialValues,
    openForm: (menu) => set({ isFormOpen: true, selectedMenu: menu || null }),
    closeForm: () => set({ isFormOpen: false, selectedMenu: null }),
    openDelete: (menu) => set({ isDeleteOpen: true, selectedMenu: menu }),
    closeDelete: () => set({ isDeleteOpen: false, selectedMenu: null }),
    resetStore: () => set(initialValues),
}));

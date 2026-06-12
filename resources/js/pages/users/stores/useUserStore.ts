// @/features/users/store/useUserStore.ts

import { create } from 'zustand';
import type {User} from '../types'; // Impor tipe data dari file terpisah

// State murni untuk data
interface UserState {
    isFormOpen: boolean;
    isDetailOpen: boolean;
    isDeleteOpen: boolean;
    selectedUser: User | null;
    selectedRowIds: Record<string, boolean>;
}

// Actions untuk fungsi pengubah data
interface UserActions {
    openForm: (user?: User) => void;
    closeForm: () => void;
    openDetail: (user: User) => void;
    closeDetail: () => void;
    openDelete: (user: User) => void;
    closeDelete: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type UserStore = UserState & UserActions;

const initialValues: UserState = {
    isFormOpen: false,
    isDetailOpen: false,
    isDeleteOpen: false,
    selectedUser: null,
    selectedRowIds: {},
};

export const useUserStore = create<UserStore>((set) => ({
    ...initialValues,

    openForm: (user) => set({ isFormOpen: true, selectedUser: user ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedUser: null }),
    openDetail: (user) => set({ isDetailOpen: true, selectedUser: user }),
    closeDetail: () => set({ isDetailOpen: false, selectedUser: null }),
    openDelete: (user) => set({ isDeleteOpen: true, selectedUser: user }),
    closeDelete: () => set({ isDeleteOpen: false, selectedUser: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
}));
export { User };


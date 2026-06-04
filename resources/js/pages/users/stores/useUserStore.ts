// @/features/users/store/useUserStore.ts

import { create } from 'zustand';
import type {User} from '../types'; // Impor tipe data dari file terpisah

// State murni untuk data
interface UserState {
    isFormOpen: boolean;
    selectedUser: User | null;
    selectedRowIds: Record<string, boolean>;
}

// Actions untuk fungsi pengubah data
interface UserActions {
    openForm: (user?: User) => void;
    closeForm: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
}

type UserStore = UserState & UserActions;

const initialValues: UserState = {
    isFormOpen: false,
    selectedUser: null,
    selectedRowIds: {},
};

export const useUserStore = create<UserStore>((set) => ({
    ...initialValues,

    openForm: (user) => set({ isFormOpen: true, selectedUser: user ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedUser: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
}));
export { User };


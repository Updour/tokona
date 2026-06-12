import { create } from 'zustand';
import type { Role } from '../types';

interface RoleState {
    isCreateOpen: boolean;
    selectedRole: Role | null;
}

interface RoleActions {
    openCreate: () => void;
    closeCreate: () => void;
    setSelectedRole: (role: Role | null) => void;
    resetStore: () => void;
}

type RoleStore = RoleState & RoleActions;

const initialValues: RoleState = {
    isCreateOpen: false,
    selectedRole: null,
};

export const useRoleStore = create<RoleStore>((set) => ({
    ...initialValues,

    openCreate: () => set({ isCreateOpen: true }),
    closeCreate: () => set({ isCreateOpen: false }),
    setSelectedRole: (role) => set({ selectedRole: role }),
    resetStore: () => set(initialValues),
}));

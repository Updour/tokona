import { create } from 'zustand';
import { type Branch } from '../types';

interface BranchState {
    isFormOpen: boolean;
    isViewOpen: boolean;
    selectedBranch: Branch | null;
    selectedRowIds: Record<string, boolean>;
}

interface BranchActions {
    openForm: (branch?: any) => void;
    openView: (branch?: any) => void;
    closeForm: () => void;
    setSelectedRowIds: (ids: Record<string, boolean>) => void;
    resetStore: () => void;
    closeView: () => void;
}

type BranchStore = BranchState & BranchActions;

const initialValues: BranchState = {
    isFormOpen: false,
    isViewOpen: false,
    selectedBranch: null,
    selectedRowIds: {},
};

export const useBranchStore = create<BranchStore>((set) => ({
    ...initialValues,

    openForm: (branch) => set({ isFormOpen: true, selectedBranch: branch ?? null }),
    closeForm: () => set({ isFormOpen: false, selectedBranch: null }),
    setSelectedRowIds: (ids) => set({ selectedRowIds: ids }),
    resetStore: () => set(initialValues),
    openView: (branch) => set({ isViewOpen: true, selectedBranch: branch }),
    closeView: () => set({ isViewOpen: false, selectedBranch: null }),
}));

export { Branch };

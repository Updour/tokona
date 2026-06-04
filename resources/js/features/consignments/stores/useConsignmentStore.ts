import { create } from 'zustand';

interface ConsignmentState {
    isReceiveFormOpen: boolean;
    isSettleFormOpen: boolean;
    selectedConsignment: any | null;
    isDetailFormOpen: boolean;
    selectedConsignmentDetail: any | null;
    isEditFormOpen: boolean;
    selectedConsignmentEdit: any | null;

    openReceiveForm: () => void;
    closeReceiveForm: () => void;

    openSettleForm: (consignment: any) => void;
    closeSettleForm: () => void;

    openDetailForm: (consignment: any) => void;
    closeDetailForm: () => void;

    openEditForm: (consignment: any) => void;
    closeEditForm: () => void;
}

export const useConsignmentStore = create<ConsignmentState>((set) => ({
    isReceiveFormOpen: false,
    isSettleFormOpen: false,
    selectedConsignment: null,
    isDetailFormOpen: false,
    selectedConsignmentDetail: null,
    isEditFormOpen: false,
    selectedConsignmentEdit: null,

    openReceiveForm: () => set({ isReceiveFormOpen: true }),
    closeReceiveForm: () => set({ isReceiveFormOpen: false }),

    openSettleForm: (consignment) => set({ isSettleFormOpen: true, selectedConsignment: consignment }),
    closeSettleForm: () => set({ isSettleFormOpen: false, selectedConsignment: null }),

    openDetailForm: (consignment) => set({ isDetailFormOpen: true, selectedConsignmentDetail: consignment }),
    closeDetailForm: () => set({ isDetailFormOpen: false, selectedConsignmentDetail: null }),

    openEditForm: (consignment) => set({ isEditFormOpen: true, selectedConsignmentEdit: consignment }),
    closeEditForm: () => set({ isEditFormOpen: false, selectedConsignmentEdit: null }),
}));

import { create } from 'zustand';

interface TransferState {
    isCreateOpen: boolean;
    receiveTransfer: any | null;
    detailTransfer: any | null;

    openCreate: () => void;
    closeCreate: () => void;
    
    openReceive: (transfer: any) => void;
    closeReceive: () => void;

    openDetail: (transfer: any) => void;
    closeDetail: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
    isCreateOpen: false,
    receiveTransfer: null,
    detailTransfer: null,

    openCreate: () => set({ isCreateOpen: true }),
    closeCreate: () => set({ isCreateOpen: false }),

    openReceive: (transfer) => set({ receiveTransfer: transfer }),
    closeReceive: () => set({ receiveTransfer: null }),

    openDetail: (transfer) => set({ detailTransfer: transfer }),
    closeDetail: () => set({ detailTransfer: null }),
}));

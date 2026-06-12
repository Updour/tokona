import { create } from 'zustand';

interface PayrollState {
    isGenerateOpen: boolean;
    isBulkGenerateOpen: boolean;
    confirmPayId: string | null;

    openGenerate: () => void;
    closeGenerate: () => void;

    openBulkGenerate: () => void;
    closeBulkGenerate: () => void;

    openConfirmPay: (id: string) => void;
    closeConfirmPay: () => void;
}

export const usePayrollStore = create<PayrollState>((set) => ({
    isGenerateOpen: false,
    isBulkGenerateOpen: false,
    confirmPayId: null,

    openGenerate: () => set({ isGenerateOpen: true }),
    closeGenerate: () => set({ isGenerateOpen: false }),

    openBulkGenerate: () => set({ isBulkGenerateOpen: true }),
    closeBulkGenerate: () => set({ isBulkGenerateOpen: false }),

    openConfirmPay: (id) => set({ confirmPayId: id }),
    closeConfirmPay: () => set({ confirmPayId: null }),
}));

import { create } from 'zustand';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface StockAuditState {
    isResolving: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    resolveNegativeStock: (productId: string) => Promise<void>;
    resolveTransferMismatch: (transferId: string) => Promise<void>;
}

export const useStockAuditStore = create<StockAuditState>((set) => ({
    isResolving: false,
    activeTab: 'negative_stock',
    setActiveTab: (tab) => set({ activeTab: tab }),
    resolveNegativeStock: async (productId: string) => {
        set({ isResolving: true });
        router.post(`/audit/stock-anomalies/negative-stock/${productId}/resolve`, {}, {
            onSuccess: () => {
                toast.success('Stok negatif berhasil diselaraskan ke 0!');
                set({ isResolving: false });
            },
            onError: () => {
                toast.error('Gagal menyelaraskan stok negatif.');
                set({ isResolving: false });
            },
        });
    },
    resolveTransferMismatch: async (transferId: string) => {
        set({ isResolving: true });
        router.post(`/audit/stock-anomalies/transfer-mismatch/${transferId}/resolve`, {}, {
            onSuccess: () => {
                toast.success('Selisih transfer cabang berhasil diselaraskan!');
                set({ isResolving: false });
            },
            onError: () => {
                toast.error('Gagal menyelaraskan selisih transfer.');
                set({ isResolving: false });
            },
        });
    },
}));

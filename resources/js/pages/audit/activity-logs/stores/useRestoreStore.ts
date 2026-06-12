import { create } from 'zustand';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface RestoreState {
    isRestoring: boolean;
    restoreProduct: (id: string) => Promise<void>;
    restoreCustomer: (id: string) => Promise<void>;
}

export const useRestoreStore = create<RestoreState>((set) => ({
    isRestoring: false,
    restoreProduct: async (id: string) => {
        set({ isRestoring: true });
        router.post(`/products/${id}/restore`, {}, {
            onSuccess: () => {
                toast.success('Produk berhasil dipulihkan!');
                set({ isRestoring: false });
            },
            onError: () => {
                toast.error('Gagal memulihkan produk.');
                set({ isRestoring: false });
            },
        });
    },
    restoreCustomer: async (id: string) => {
        set({ isRestoring: true });
        router.post(`/customers/${id}/restore`, {}, {
            onSuccess: () => {
                toast.success('Pelanggan berhasil dipulihkan!');
                set({ isRestoring: false });
            },
            onError: () => {
                toast.error('Gagal memulihkan pelanggan.');
                set({ isRestoring: false });
            },
        });
    },
}));

import { create } from 'zustand';
import type { SalesPerson } from '../types';

interface SalesState {
    selectedSales: SalesPerson | null;
    isAddOpen: boolean;
    isEditOpen: boolean;
    isDeleteOpen: boolean;
    isStockOpen: boolean;
    isPerformanceOpen: boolean;

    setSelectedSales: (sales: SalesPerson | null) => void;
    
    openAdd: () => void;
    closeAdd: () => void;
    
    openEdit: (sales: SalesPerson) => void;
    closeEdit: () => void;
    
    openDelete: (sales: SalesPerson) => void;
    closeDelete: () => void;
    
    openStock: (sales: SalesPerson) => void;
    closeStock: () => void;
    
    openPerformance: (sales: SalesPerson) => void;
    closePerformance: () => void;
}

export const useSalesStore = create<SalesState>((set) => ({
    selectedSales: null,
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isStockOpen: false,
    isPerformanceOpen: false,

    setSelectedSales: (sales) => set({ selectedSales: sales }),

    openAdd: () => set({ isAddOpen: true }),
    closeAdd: () => set({ isAddOpen: false }),

    openEdit: (sales) => set({ isEditOpen: true, selectedSales: sales }),
    closeEdit: () => set({ isEditOpen: false, selectedSales: null }),

    openDelete: (sales) => set({ isDeleteOpen: true, selectedSales: sales }),
    closeDelete: () => set({ isDeleteOpen: false, selectedSales: null }),

    openStock: (sales) => set({ isStockOpen: true, selectedSales: sales }),
    closeStock: () => set({ isStockOpen: false, selectedSales: null }),

    openPerformance: (sales) => set({ isPerformanceOpen: true, selectedSales: sales }),
    closePerformance: () => set({ isPerformanceOpen: false, selectedSales: null }),
}));

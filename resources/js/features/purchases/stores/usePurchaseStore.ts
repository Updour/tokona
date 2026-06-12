import { create } from 'zustand';
import { getTodayDateString } from '@/lib/helpers/date';

interface PurchaseItem {
    product_id: string;
    qty: number;
    unit_cost: number;
    discount: number;
}

interface PurchaseState {
    branch_id: string;
    supplier_id: string;
    invoice_number: string;
    purchase_date: string;
    status: string;
    global_discount: number;
    items: PurchaseItem[];
    
    // Actions
    setField: (field: keyof Omit<PurchaseState, 'items' | 'setField' | 'addItem' | 'removeItem' | 'updateItem' | 'resetForm' | 'totalProductCost' | 'totalBill'>, value: any) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, field: keyof PurchaseItem, value: any, products: any[]) => void;
    resetForm: () => void;

    // Getters
    totalProductCost: () => number;
    totalBill: () => number;
}

const initialState = {
    branch_id: '',
    supplier_id: '',
    invoice_number: '',
    purchase_date: getTodayDateString(),
    status: 'draft',
    global_discount: 0,
    items: []
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
    ...initialState,

    setField: (field, value) => set({ [field]: value }),

    addItem: () => set((state) => ({
        items: [...state.items, { product_id: '', qty: 1, unit_cost: 0, discount: 0 }]
    })),

    removeItem: (index) => set((state) => {
        const newItems = [...state.items];
        newItems.splice(index, 1);
        return { items: newItems };
    }),

    updateItem: (index, field, value, products) => set((state) => {
        const newItems = [...state.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            const existingIndex = newItems.findIndex((item, i) => item.product_id === value && i !== index);

            if (existingIndex !== -1) {
                newItems[existingIndex].qty += Number(newItems[index].qty || 1);
                newItems.splice(index, 1);
                return { items: newItems };
            }

            const selectedProduct = products.find((p: any) => p.id === value);
            if (selectedProduct) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value as string,
                    unit_cost: Number(selectedProduct.base_cost) || 0,
                    discount: 0
                };
            }
        }

        return { items: newItems };
    }),

    resetForm: () => set(initialState),

    totalProductCost: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + ((item.qty * item.unit_cost) - (item.discount || 0)), 0);
    },

    totalBill: () => {
        const totalCost = get().totalProductCost();
        const globalDiscount = get().global_discount || 0;
        return totalCost - globalDiscount;
    }
}));

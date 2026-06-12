import { create } from 'zustand';

interface ShiftState {
    isCloseOpen: boolean;
    selectedShift: any | null;
}

interface ShiftActions {
    openClose: (shift: any) => void;
    closeClose: () => void;
}

type ShiftStore = ShiftState & ShiftActions;

const initialValues: ShiftState = {
    isCloseOpen: false,
    selectedShift: null,
};

export const useShiftStore = create<ShiftStore>((set) => ({
    ...initialValues,
    openClose: (shift) => set({ isCloseOpen: true, selectedShift: shift }),
    closeClose: () => set({ isCloseOpen: false, selectedShift: null }),
}));

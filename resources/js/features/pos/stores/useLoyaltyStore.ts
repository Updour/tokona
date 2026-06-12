import { create } from 'zustand';

interface LoyaltyState {
    redeemPointsInput: string;
    redeemPoints: number;
}

interface LoyaltyActions {
    setRedeemPointsInput: (input: string) => void;
    setRedeemPoints: (points: number) => void;
    clearRedeem: () => void;
}

type LoyaltyStore = LoyaltyState & LoyaltyActions;

const initialValues: LoyaltyState = {
    redeemPointsInput: '',
    redeemPoints: 0,
};

export const useLoyaltyStore = create<LoyaltyStore>((set) => ({
    ...initialValues,
    setRedeemPointsInput: (input) => set({ redeemPointsInput: input }),
    setRedeemPoints: (points) => set({ redeemPoints: points }),
    clearRedeem: () => set(initialValues),
}));

import { create } from 'zustand';
import { router } from '@inertiajs/react';

interface MarketingState {
    sentIds: Set<string>;
    sentCount: number;
    campaignId: string | null;
}

interface MarketingActions {
    initializeQueue: (campaignId: string, initialSentCount: number) => void;
    markAsSent: (customerId: string) => void;
    updateServerProgress: () => void;
    resetStore: () => void;
}

type MarketingStore = MarketingState & MarketingActions;

const initialValues: MarketingState = {
    sentIds: new Set(),
    sentCount: 0,
    campaignId: null,
};

export const useMarketingStore = create<MarketingStore>((set, get) => ({
    ...initialValues,

    initializeQueue: (campaignId: string, initialSentCount: number) => {
        const stored = localStorage.getItem(`campaign_${campaignId}_sent`);
        let initialSet = new Set<string>();
        let currentCount = initialSentCount;

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                initialSet = new Set(parsed);
                if (parsed.length > currentCount) {
                    currentCount = parsed.length;
                    
                    // Silent update server if local count is higher
                    router.post(`/business/marketing/${campaignId}/progress`, { sent_count: currentCount }, {
                        preserveScroll: true,
                        preserveState: true,
                        only: []
                    });
                }
            } catch (e) {
                // ignore
            }
        }

        set({
            campaignId,
            sentIds: initialSet,
            sentCount: currentCount,
        });
    },

    markAsSent: (customerId: string) => {
        const { sentIds, campaignId } = get();
        if (!campaignId) return;

        const newSentIds = new Set(sentIds);
        newSentIds.add(customerId);
        
        const newCount = newSentIds.size;

        localStorage.setItem(`campaign_${campaignId}_sent`, JSON.stringify(Array.from(newSentIds)));

        set({
            sentIds: newSentIds,
            sentCount: newCount,
        });

        get().updateServerProgress();
    },

    updateServerProgress: () => {
        const { campaignId, sentCount } = get();
        if (!campaignId) return;

        router.post(`/business/marketing/${campaignId}/progress`, { sent_count: sentCount }, {
            preserveScroll: true,
            preserveState: true,
            only: []
        });
    },

    resetStore: () => set(initialValues),
}));

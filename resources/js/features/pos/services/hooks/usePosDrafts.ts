import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UsePosDraftsProps {
    cart: any[];
    setCart: (cart: any[]) => void;
    selectedCustomer: string;
    setSelectedCustomer: (id: string) => void;
    selectedPromo: string | null;
    setSelectedPromo: (id: string | null) => void;
    paymentMethod: string;
    setPaymentMethod: (method: any) => void;
    setActiveTab: (tab: string) => void;
}

export function usePosDrafts({
    cart,
    setCart,
    selectedCustomer,
    setSelectedCustomer,
    selectedPromo,
    setSelectedPromo,
    paymentMethod,
    setPaymentMethod,
    setActiveTab
}: UsePosDraftsProps) {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [draftNotes, setDraftNotes] = useState('');
    const [showDraftModal, setShowDraftModal] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('tokona_pos_drafts');

        if (stored) {
            try {
                setDrafts(JSON.parse(stored));
            } catch (e) {
                // Gunakan default array kosong jika parsing gagal
            }
        }
    }, []);

    const handleSaveDraft = () => {
        if (cart.length === 0) {
            toast.error('Tidak ada barang di keranjang untuk disimpan.');

            return;
        }

        const newDraft = {
            id: `draft_${new Date().getTime()}`,
            date: new Date(),
            notes: draftNotes || `Antrean #${drafts.length + 1}`,
            items: [...cart],
            customer_id: selectedCustomer,
            promo_id: selectedPromo,
            payment_method: paymentMethod
        };

        const updated = [newDraft, ...drafts];
        setDrafts(updated);
        localStorage.setItem('tokona_pos_drafts', JSON.stringify(updated));

        setCart([]);
        setDraftNotes('');
        setShowDraftModal(false);
        toast.success('Transaksi berhasil ditahan sebagai draft/pending order.');
    };

    const handleLoadDraft = (draft: any) => {
        setCart(draft.items);
        setSelectedCustomer(draft.customer_id);
        setSelectedPromo(draft.promo_id);
        setPaymentMethod(draft.payment_method);

        const updated = drafts.filter(d => d.id !== draft.id);
        setDrafts(updated);
        localStorage.setItem('tokona_pos_drafts', JSON.stringify(updated));

        setActiveTab('cashier');
        toast.success(`Draft "${draft.notes}" berhasil dimuat kembali ke kasir.`);
    };

    const handleDeleteDraft = (id: string) => {
        const updated = drafts.filter(d => d.id !== id);
        setDrafts(updated);
        localStorage.setItem('tokona_pos_drafts', JSON.stringify(updated));
        toast.info('Draft transaksi berhasil dihapus.');
    };

    return {
        drafts,
        setDrafts,
        draftNotes,
        setDraftNotes,
        showDraftModal,
        setShowDraftModal,
        handleSaveDraft,
        handleLoadDraft,
        handleDeleteDraft
    };
}

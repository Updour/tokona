import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePosReturnsProps {
    transactions: any[];
    setActiveTab: (tab: string) => void;
}

export function usePosReturns({
    transactions,
    setActiveTab
}: UsePosReturnsProps) {
    const [selectedReturnTxId, setSelectedReturnTxId] = useState('select');
    const [returnItems, setReturnItems] = useState<any[]>([]);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

    const handleReturnTxChange = (txId: string) => {
        setSelectedReturnTxId(txId);

        if (txId === 'select') {
            setReturnItems([]);

            return;
        }

        const tx = transactions.find((t: any) => t.id === txId);

        if (tx) {
            setReturnItems(tx.items.map((i: any) => ({
                product_id: i.product_id,
                name: i.product?.name ?? 'Produk Dihapus',
                sku: i.product?.sku ?? '-',
                price: parseFloat(i.price),
                qty_bought: i.qty,
                qty: i.qty
            })));
        }
    };

    const handleReturnQtyChange = (productId: string, val: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(0, Math.min(item.qty_bought, val));

                return { ...item, qty: newQty };
            }

            return item;
        }));
    };

    const handleReturnQtyInputChange = (productId: string, val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');

        if (cleanVal === '') {
            setReturnItems(returnItems.map(i => i.product_id === productId ? { ...i, qty: 0 } : i));

            return;
        }

        const parsed = parseInt(cleanVal);
        setReturnItems(returnItems.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(0, Math.min(item.qty_bought, parsed));

                if (parsed > item.qty_bought) {
                    toast.error(`Jumlah retur melebihi batas pembelian (${item.qty_bought} item).`);
                }

                return { ...item, qty: newQty };
            }

            return item;
        }));
    };

    const handleProcessReturn = () => {
        const itemsToReturn = returnItems.filter(i => i.qty > 0);

        if (itemsToReturn.length === 0) {
            toast.error('Tentukan minimal 1 barang dengan jumlah retur > 0.');

            return;
        }

        setIsSubmittingReturn(true);

        const payload = {
            transaction_id: selectedReturnTxId,
            items: itemsToReturn.map(i => ({
                product_id: i.product_id,
                qty: i.qty,
                price: i.price
            }))
        };

        router.post('/pos/return', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingReturn(false);
                setSelectedReturnTxId('select');
                setReturnItems([]);
                toast.success('Retur penjualan berhasil diproses!');
                setActiveTab('transactions');
            },
            onError: (err) => {
                setIsSubmittingReturn(false);
                const firstErr = Object.values(err)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal memproses retur.');
            }
        });
    };

    return {
        selectedReturnTxId,
        setSelectedReturnTxId,
        returnItems,
        setReturnItems,
        isSubmittingReturn,
        handleReturnTxChange,
        handleReturnQtyChange,
        handleReturnQtyInputChange,
        handleProcessReturn
    };
}

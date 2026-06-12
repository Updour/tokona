import { formatNumber } from '@/lib/helpers/format';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useLoyaltyStore } from '../../stores/useLoyaltyStore';

interface UsePosCartProps {
    products: any[];
    customers: any[];
    promos: any[];
    posSettings: any;
    loyaltySettings?: any;
}

export function usePosCart({
    products,
    customers,
    promos,
    posSettings,
    loyaltySettings
}: UsePosCartProps) {
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('umum');
    const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'debt' | 'split'>('cash');
    const [splitCashInput, setSplitCashInput] = useState<string>('');
    const [splitTransferInput, setSplitTransferInput] = useState<string>('');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paidAmountInput, setPaidAmountInput] = useState<string>('');
    const [manualDiscount, setManualDiscount] = useState<number>(0);
    const [manualDiscountInput, setManualDiscountInput] = useState<string>('');

    const { redeemPoints, redeemPointsInput, setRedeemPoints, setRedeemPointsInput, clearRedeem } = useLoyaltyStore();

    // Pastikan poin tersetel ulang kalau pembeli di-clear
    useEffect(() => {
        if (!selectedCustomer) {
            clearRedeem();
        }
    }, [selectedCustomer, clearRedeem]);

    const handleAddToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            const nextQty = existing.qty + 1;

            if (product.track_stock && nextQty > product.current_stock) {
                toast.error(`Stok maksimal "${product.name}" hanya tersisa ${product.current_stock} item.`);

                return;
            }

            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, qty: nextQty, subtotal: nextQty * item.price }
                    : item
            ));
            toast.success(`Jumlah "${product.name}" ditambah menjadi ${nextQty}`);
        } else {
            if (product.track_stock && product.current_stock <= 0) {
                toast.error(`Produk "${product.name}" sedang kosong.`);

                return;
            }

            setCart([...cart, {
                id: product.id,
                name: product.name,
                price: product.sell_price,
                qty: 1,
                subtotal: product.sell_price,
                trackStock: product.track_stock,
                maxStock: product.current_stock,
                image: product.image
            }]);
            toast.success(`"${product.name}" berhasil dimasukkan keranjang.`);
        }
    };

    const updateQty = (id: string, delta: number) => {
        const item = cart.find(i => i.id === id);

        if (!item) {
return;
}

        const newQty = item.qty + delta;

        if (newQty <= 0) {
            setCart(cart.filter(i => i.id !== id));
            toast.info(`"${item.name}" dihapus dari keranjang.`);

            return;
        }

        if (item.trackStock && delta > 0 && newQty > item.maxStock) {
            toast.error(`Stok maksimal "${item.name}" hanya tersisa ${item.maxStock} item.`);

            return;
        }

        setCart(cart.map(i =>
            i.id === id
                ? { ...i, qty: newQty, subtotal: newQty * i.price }
                : i
        ));
    };

    const handleQtyInputChange = (id: string, val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');

        if (cleanVal === '') {
            setCart(cart.map(i => i.id === id ? { ...i, qty: 0, subtotal: 0 } : i));

            return;
        }

        const parsed = parseInt(cleanVal);
        const item = cart.find(i => i.id === id);

        if (!item) {
return;
}

        if (item.trackStock && parsed > item.maxStock) {
            toast.error(`Stok maksimal "${item.name}" hanya tersisa ${item.maxStock} item.`);
            setCart(cart.map(i => i.id === id ? { ...i, qty: item.maxStock, subtotal: item.maxStock * i.price } : i));

            return;
        }

        setCart(cart.map(i =>
            i.id === id
                ? { ...i, qty: parsed, subtotal: parsed * i.price }
                : i
        ));
    };

    const handleQtyInputBlur = (id: string, qty: number) => {
        if (qty <= 0) {
            const item = cart.find(i => i.id === id);

            if (item) {
                setCart(cart.map(i => i.id === id ? { ...i, qty: 1, subtotal: 1 * i.price } : i));
            }
        }
    };

    const handleRemoveFromCart = (id: string, name: string) => {
        setCart(cart.filter(item => item.id !== id));
        toast.info(`"${name}" dihapus dari keranjang.`);
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    }, [cart]);

    const activePromoObj = useMemo(() => {
        if (!selectedPromo) {
return null;
}

        return promos.find((p: any) => p.id === selectedPromo);
    }, [selectedPromo, promos]);

    const cartDiscount = useMemo(() => {
        let promoDiscount = 0;

        if (activePromoObj) {
            const isMinMet = !activePromoObj.min_amount || cartSubtotal >= parseFloat(activePromoObj.min_amount);

            if (isMinMet) {
                if (activePromoObj.type === 'percentage') {
                    promoDiscount = (cartSubtotal * parseFloat(activePromoObj.value)) / 100;
                } else {
                    promoDiscount = parseFloat(activePromoObj.value);
                }
            }
        }

        const pointDiscount = redeemPoints * (loyaltySettings?.redeem_rate || 1);

        return promoDiscount + manualDiscount + pointDiscount;
    }, [activePromoObj, cartSubtotal, manualDiscount, redeemPoints, loyaltySettings]);

    const cartTax = useMemo(() => {
        if (!posSettings.taxEnabled) {
return 0;
}

        const rate = (posSettings.taxRate || 0) / 100;
        const netAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);

        return Math.round(netAfterDiscount * rate);
    }, [cartSubtotal, cartDiscount, posSettings]);

    const rawTotal = useMemo(() => {
        const netAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);

        return netAfterDiscount + cartTax;
    }, [cartSubtotal, cartDiscount, cartTax]);

    const cartTotal = useMemo(() => {
        if (paymentMethod !== 'cash') {
return rawTotal;
}

        const nearest = parseInt(posSettings.roundingNearest) || 1;

        if (nearest <= 1) {
return rawTotal;
}

        const method = posSettings.roundingMethod || 'floor';

        if (method === 'floor') {
            return Math.floor(rawTotal / nearest) * nearest;
        } else if (method === 'ceil') {
            return Math.ceil(rawTotal / nearest) * nearest;
        } else {
            return Math.round(rawTotal / nearest) * nearest;
        }
    }, [rawTotal, paymentMethod, posSettings.roundingNearest, posSettings.roundingMethod]);

    const roundingDiff = useMemo(() => {
        return cartTotal - rawTotal;
    }, [cartTotal, rawTotal]);

    const changeAmount = useMemo(() => {
        if (paymentMethod === 'debt') {
return 0;
}

        if (paymentMethod === 'split') {
            const splitTotal = Number(splitCashInput) + Number(splitTransferInput);

            return Math.max(0, splitTotal - cartTotal);
        }

        return Math.max(0, paidAmount - cartTotal);
    }, [paidAmount, cartTotal, paymentMethod, splitCashInput, splitTransferInput]);

    const handlePaidAmountChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        const parsed = parseFloat(cleanVal);
        const numericValue = isNaN(parsed) ? 0 : parsed;
        setPaidAmount(numericValue);

        if (cleanVal === '') {
            setPaidAmountInput('');
        } else {
            setPaidAmountInput(formatNumber(numericValue));
        }
    };

    const handleSplitCashChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        setSplitCashInput(cleanVal);
    };

    const handleSplitTransferChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        setSplitTransferInput(cleanVal);
    };

    const handleManualDiscountChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');

        if (cleanVal === '') {
            setManualDiscountInput('');
            setManualDiscount(0);

            return;
        }

        const parsed = parseInt(cleanVal);

        if (parsed > cartSubtotal) {
            toast.error('Diskon tidak boleh melebihi subtotal belanja!');
            setManualDiscountInput(formatNumber(cartSubtotal));
            setManualDiscount(cartSubtotal);

            return;
        }

        setManualDiscountInput(formatNumber(parsed));
        setManualDiscount(parsed);
    };

    const handleRedeemPointsChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');

        if (cleanVal === '') {
            setRedeemPointsInput('');
            setRedeemPoints(0);

            return;
        }

        const parsed = parseInt(cleanVal);

        const customerObj = customers.find((c: any) => c.id === selectedCustomer);
        const maxPoints = customerObj ? customerObj.points : 0;
        const maxRedeemAmount = maxPoints * (loyaltySettings?.redeem_rate || 1);
        
        // Poin yang mau di-redeem dikalikan rate tidak boleh melebihi subtotal
        if ((parsed * (loyaltySettings?.redeem_rate || 1)) > cartSubtotal) {
            toast.error('Diskon Tukar Poin tidak boleh melebihi subtotal belanja!');
            
            // Hitung maks poin yang bisa ditukar agar pas subtotal
            const maxPointsForSubtotal = Math.floor(cartSubtotal / (loyaltySettings?.redeem_rate || 1));
            setRedeemPointsInput(formatNumber(maxPointsForSubtotal));
            setRedeemPoints(maxPointsForSubtotal);

            return;
        }

        if (parsed > maxPoints) {
            toast.error(`Poin pelanggan tidak mencukupi. Sisa poin: ${maxPoints}`);
            setRedeemPointsInput(formatNumber(maxPoints));
            setRedeemPoints(maxPoints);

            return;
        }

        setRedeemPointsInput(formatNumber(parsed));
        setRedeemPoints(parsed);
    };

    const setQuickCash = (amount: number) => {
        setPaidAmount(amount);
        setPaidAmountInput(formatNumber(amount));
    };

    const clearCart = () => {
        setCart([]);
        setPaidAmount(0);
        setPaidAmountInput('');
        setSelectedPromo(null);
        setSelectedCustomer('umum');
        setPaymentMethod('cash');
        setSplitCashInput('');
        setSplitTransferInput('');
        setManualDiscount(0);
        setManualDiscountInput('');
        clearRedeem();
    };

    return {
        cart,
        setCart,
        selectedCustomer,
        setSelectedCustomer,
        selectedPromo,
        setSelectedPromo,
        paymentMethod,
        setPaymentMethod,
        splitCashInput,
        setSplitCashInput,
        splitTransferInput,
        setSplitTransferInput,
        paidAmount,
        setPaidAmount,
        paidAmountInput,
        setPaidAmountInput,
        manualDiscount,
        setManualDiscount,
        manualDiscountInput,
        setManualDiscountInput,
        redeemPoints,
        setRedeemPoints,
        redeemPointsInput,
        setRedeemPointsInput,
        cartSubtotal,
        cartDiscount,
        cartTax,
        cartTotal,
        roundingDiff,
        changeAmount,
        activePromoObj,
        handleAddToCart,
        updateQty,
        handleQtyInputChange,
        handleQtyInputBlur,
        handleRemoveFromCart,
        handlePaidAmountChange,
        handleSplitCashChange,
        handleSplitTransferChange,
        handleManualDiscountChange,
        handleRedeemPointsChange,
        setQuickCash,
        clearCart
    };
}

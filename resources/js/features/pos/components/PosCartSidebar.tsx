import { useState, useEffect } from 'react';
import { PosCartItemsList } from './PosCartItemsList';
import { PosPaymentPanel } from './PosPaymentPanel';

interface PosCartSidebarProps {
    cart: any[];
    updateQty: (id: string, delta: number) => void;
    handleQtyInputChange: (id: string, val: string) => void;
    handleQtyInputBlur: (id: string, qty: number) => void;
    handleRemoveFromCart: (id: string, name: string) => void;
    selectedCustomer: string;
    setSelectedCustomer: (c: string) => void;
    customers: any[];
    selectedPromo: string | null;
    setSelectedPromo: (p: string | null) => void;
    promos: any[];
    isPaymentExpanded: boolean;
    setIsPaymentExpanded: (e: boolean) => void;
    cartTotal: number;
    cartSubtotal: number;
    cartDiscount: number;
    manualDiscountInput: string;
    handleManualDiscountChange: (v: string) => void;
    redeemPointsInput: string;
    handleRedeemPointsChange: (v: string) => void;
    posSettings: any;
    roundingDiff: number;
    cartTax: number;
    paymentMethod: 'cash' | 'transfer' | 'debt' | 'split';
    setPaymentMethod: (m: 'cash' | 'transfer' | 'debt' | 'split') => void;
    splitCashInput: string;
    handleSplitCashChange: (v: string) => void;
    splitTransferInput: string;
    handleSplitTransferChange: (v: string) => void;
    paidAmountInput: string;
    handlePaidAmountChange: (v: string) => void;
    setQuickCash: (amt: number) => void;
    changeAmount: number;
    dueDate: string;
    setDueDate: (date: string) => void;
    handleCheckout: () => void;
    isSubmitting: boolean;
    setShowDraftModal: (show: boolean) => void;
    loyaltySettings?: any;
}

export function PosCartSidebar(props: PosCartSidebarProps) {
    const [viewState, setViewState] = useState<'cart' | 'payment'>('cart');

    const totalQty = props.cart.reduce((sum, item) => sum + item.qty, 0);
    const [prevQty, setPrevQty] = useState(totalQty);

    // Otomatis geser kembali ke keranjang jika keranjang kosong atau ada barang baru masuk
    useEffect(() => {
        if (props.cart.length === 0 && viewState === 'payment') {
            setViewState('cart');
        } else if (totalQty > prevQty && viewState === 'payment') {
            setViewState('cart');
        }
        setPrevQty(totalQty);
    }, [props.cart.length, totalQty, prevQty, viewState]);

    if (props.cart.length === 0) {
        return null;
    }

    return (
        <div className="xl:col-span-3 flex flex-col bg-white rounded-2xl border shadow-md overflow-hidden h-full min-w-0 transition-all duration-500">
            {/* Kontainer Slider Horizontal */}
            <div className="w-full overflow-hidden h-full flex-1">
                <div className={`flex w-[200%] h-full transition-transform duration-300 ease-in-out ${
                    viewState === 'payment' ? '-translate-x-1/2' : 'translate-x-0'
                }`}>
                    {/* Slide 1: Daftar Barang Belanja */}
                    <div className="w-1/2 h-full flex flex-col shrink-0">
                        <PosCartItemsList
                            {...props}
                            onProceedToPayment={() => setViewState('payment')}
                        />
                    </div>

                    {/* Slide 2: Rincian Pembayaran */}
                    <div className="w-1/2 h-full flex flex-col shrink-0">
                        <PosPaymentPanel
                            {...props}
                            onBackToCart={() => setViewState('cart')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

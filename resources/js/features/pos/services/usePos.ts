import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { usePosCart } from './hooks/usePosCart';
import { usePosDrafts } from './hooks/usePosDrafts';
import { usePosReceipt } from './hooks/usePosReceipt';
import { usePosReturns } from './hooks/usePosReturns';

interface UsePosProps {
    products: any[];
    customers: any[];
    promos: any[];
    branches: any[];
    transactions: any[];
    defaultSettings: any;
    filters: any;
    loyaltySettings?: any;
}

export function usePos({
    products,
    customers,
    promos,
    branches,
    transactions,
    defaultSettings,
    filters,
    loyaltySettings
}: UsePosProps) {
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth?.user?.is_super_admin || auth?.user?.role === 'super-admin';

    const [activeTab, setActiveTab] = useState<string>('cashier');

    // Offline State Management
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingTransactions, setPendingTransactions] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('pos_pending_transactions');

            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('pos_pending_transactions', JSON.stringify(pendingTransactions));
    }, [pendingTransactions]);

    useEffect(() => {
        if (filters?.tab) {
            setActiveTab(filters.tab);
        }
    }, [filters?.tab]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const [txSearchQuery, setTxSearchQuery] = useState('');
    const [txPaymentMethod, setTxPaymentMethod] = useState('all');
    const [txStatus, setTxStatus] = useState('all');
    const [txDateRange, setTxDateRange] = useState('all');

    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx: any) => {
            const matchesSearch =
                tx.invoice_number.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
                (tx.customer?.name ?? 'pelanggan umum').toLowerCase().includes(txSearchQuery.toLowerCase());

            const matchesPayment = txPaymentMethod === 'all' || tx.payment_method === txPaymentMethod;
            const matchesStatus = txStatus === 'all' || tx.status === txStatus;

            let matchesDate = true;

            if (txDateRange !== 'all') {
                const txDate = new Date(tx.created_at);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (txDateRange === 'today') {
                    matchesDate = txDate >= today;
                } else if (txDateRange === 'yesterday') {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const endOfYesterday = new Date(today);
                    endOfYesterday.setMilliseconds(-1);
                    matchesDate = txDate >= yesterday && txDate <= endOfYesterday;
                } else if (txDateRange === 'this_week') {
                    const oneWeekAgo = new Date(today);
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    matchesDate = txDate >= oneWeekAgo;
                } else if (txDateRange === 'this_month') {
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    matchesDate = txDate >= startOfMonth;
                }
            }

            return matchesSearch && matchesPayment && matchesStatus && matchesDate;
        });
    }, [transactions, txSearchQuery, txPaymentMethod, txStatus, txDateRange]);

    const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [showPayDebtDialog, setShowPayDebtDialog] = useState(false);
    const [payDebtTransaction, setPayDebtTransaction] = useState<any>(null);

    const [posSettings, setPosSettings] = useState<any>({
        taxEnabled: true,
        taxRate: 11,
        activeMethods: {
            cash: true,
            transfer: true,
            debt: true
        },
        roundingNearest: 100,
        roundingMethod: 'floor'
    });

    const [isPaymentExpanded, setIsPaymentExpanded] = useState<boolean>(false);

    useEffect(() => {
        if (defaultSettings) {
            setPosSettings(defaultSettings);

            return;
        }

        const storedSettings = localStorage.getItem('tokona_pos_settings');

        if (storedSettings) {
            try {
                setPosSettings(JSON.parse(storedSettings));
            } catch (e) {
                // Gunakan default settings
            }
        }
    }, [defaultSettings]);

    // Sub-hook Integrations
    const {
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
    } = usePosCart({
        products,
        customers,
        promos,
        posSettings
    });

    // Keyboard Shortcuts (Hotkeys)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if modal is open (checking body overflow or a specific class could help, but for now just raw keys)
            if (e.key === 'F2') {
                e.preventDefault();
                setActiveTab('cashier');
                document.getElementById('pos-search-input')?.focus();
            } else if (e.key === 'F4') {
                e.preventDefault();
                setActiveTab('cashier');
                document.getElementById('pos-paid-amount-input')?.focus();
            } else if (e.key === 'F8') {
                e.preventDefault();
                toast('Kosongkan keranjang belanja? (Shortcut F8)', {
                    action: {
                        label: 'Ya, Kosongkan',
                        onClick: () => clearCart()
                    },
                    cancel: { label: 'Batal', onClick: () => {} }
                });
            } else if (e.key === 'F9') {
                e.preventDefault();
                // Toggle payment method
                const methods = ['cash', 'transfer', 'debt'].filter(m => posSettings?.activeMethods?.[m]);
                if (methods.length > 0) {
                    const currentIndex = methods.indexOf(paymentMethod);
                    const nextIndex = (currentIndex + 1) % methods.length;
                    setPaymentMethod(methods[nextIndex] as any);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [clearCart, paymentMethod, posSettings]);

    useEffect(() => {
        if (posSettings.activeMethods && !posSettings.activeMethods[paymentMethod]) {
            const activeKeys = Object.keys(posSettings.activeMethods).filter(k => posSettings.activeMethods[k]);

            if (activeKeys.length > 0) {
                setPaymentMethod(activeKeys[0] as any);
            }
        }
    }, [posSettings, paymentMethod, setPaymentMethod]);

    const {
        drafts,
        setDrafts,
        draftNotes,
        setDraftNotes,
        showDraftModal,
        setShowDraftModal,
        handleSaveDraft,
        handleLoadDraft,
        handleDeleteDraft
    } = usePosDrafts({
        cart,
        setCart,
        selectedCustomer,
        setSelectedCustomer,
        selectedPromo,
        setSelectedPromo,
        paymentMethod,
        setPaymentMethod,
        setActiveTab
    });

    const {
        selectedReturnTxId,
        setSelectedReturnTxId,
        returnItems,
        setReturnItems,
        isSubmittingReturn,
        handleReturnTxChange,
        handleReturnQtyChange,
        handleReturnQtyInputChange,
        handleProcessReturn
    } = usePosReturns({
        transactions,
        setActiveTab
    });

    const {
        lastTransaction,
        setLastTransaction,
        showSuccessModal,
        setShowSuccessModal,
        handlePrintReceipt,
        handleDownloadReceiptImage,
        handleSendWhatsAppReceipt,
        handleReprint
    } = usePosReceipt();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDb, setIsSavingDb] = useState(false);

    const handleSaveSettingsToDb = () => {
        setIsSavingDb(true);
        router.post('/pos/settings', posSettings, {
            onSuccess: () => {
                toast.success('Pengaturan kasir berhasil disimpan ke database cabang!');
                setIsSavingDb(false);
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan kasir ke database.');
                setIsSavingDb(false);
            }
        });
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Keranjang belanja Anda masih kosong.');

            return;
        }

        if (paymentMethod !== 'debt' && paidAmount < cartTotal) {
            toast.error('Jumlah uang pembayaran tidak mencukupi total tagihan.');

            return;
        }

        if (paymentMethod === 'debt' && selectedCustomer === 'umum') {
            toast.error('Pelanggan Kategori Umum tidak diizinkan menggunakan metode hutang.');

            return;
        }

        setIsSubmitting(true);

        const payload = {
            id: `OFFLINE-${new Date().getTime()}`,
            customer_id: selectedCustomer === 'umum' ? null : selectedCustomer,
            subtotal: cartSubtotal,
            discount: cartDiscount,
            tax: cartTax,
            rounding_diff: paymentMethod === 'cash' ? roundingDiff : 0,
            total: cartTotal,
            paid_amount: paymentMethod === 'debt' ? 0 : (paymentMethod === 'split' ? (Number(splitCashInput) + Number(splitTransferInput)) : paidAmount),
            cash_amount: paymentMethod === 'split' ? Number(splitCashInput) : 0,
            transfer_amount: paymentMethod === 'split' ? Number(splitTransferInput) : 0,
            change_amount: changeAmount,
            redeem_points: redeemPoints,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product_id: item.id,
                qty: item.qty,
                price: item.price,
                subtotal: item.subtotal
            }))
        };

        if (isOffline) {
            // Save to pending queue locally
            setPendingTransactions(prev => [...prev, {
                ...payload,
                created_at: new Date().toISOString()
            }]);

            setIsSubmitting(false);

            const invoiceNum = `INV-OFF/${new Date().getTime()}`;
            const customerObj = customers.find((c: any) => c.id === selectedCustomer);
            
            // Calculate Points Earned & Current Balance
            const earnAmount = Math.max(1, loyaltySettings?.earn_amount || 10000);
            const pointsEarned = customerObj ? Math.floor(cartTotal / earnAmount) : 0;
            const roundingBonus = (paymentMethod === 'cash' && roundingDiff < 0) ? Math.floor(Math.abs(roundingDiff) / 100) : 0;
            const totalPointsEarned = pointsEarned + roundingBonus;
            const currentPointsBalance = customerObj ? (customerObj.points - redeemPoints + totalPointsEarned) : 0;

            setLastTransaction({
                invoice_number: invoiceNum,
                date: new Date(),
                items: [...cart],
                subtotal: cartSubtotal,
                discount: cartDiscount,
                tax: cartTax,
                rounding_diff: paymentMethod === 'cash' ? roundingDiff : 0,
                total: cartTotal,
                paid_amount: paymentMethod === 'debt' ? 0 : (paymentMethod === 'split' ? (Number(splitCashInput) + Number(splitTransferInput)) : paidAmount),
                cash_amount: paymentMethod === 'split' ? Number(splitCashInput) : 0,
                transfer_amount: paymentMethod === 'split' ? Number(splitTransferInput) : 0,
                change_amount: changeAmount,
                payment_method: paymentMethod,
                customer: customerObj ? customerObj.name : 'Pelanggan Umum',
                cashier: auth?.user?.name || 'Kasir (Offline)',
                earned_points: totalPointsEarned,
                current_points: currentPointsBalance
            });

            clearCart();
            setShowSuccessModal(true);
            toast.success('Offline Mode: Transaksi disimpan secara lokal di perangkat!');

            return;
        }

        // Online checkout process

        router.post('/pos/checkout', payload, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setIsSubmitting(false);

                const invoiceNum = page.props.flash?.success?.split('Nomor Invoice: ')[1] || `INV/${new Date().getTime()}`;
                const customerObj = customers.find((c: any) => c.id === selectedCustomer);

                // Calculate Points Earned & Current Balance
                const earnAmount = Math.max(1, loyaltySettings?.earn_amount || 10000);
                const pointsEarned = customerObj ? Math.floor(cartTotal / earnAmount) : 0;
                const roundingBonus = (paymentMethod === 'cash' && roundingDiff < 0) ? Math.floor(Math.abs(roundingDiff) / 100) : 0;
                const totalPointsEarned = pointsEarned + roundingBonus;
                const currentPointsBalance = customerObj ? (customerObj.points - redeemPoints + totalPointsEarned) : 0;

                setLastTransaction({
                    invoice_number: invoiceNum,
                    date: new Date(),
                    items: [...cart],
                    subtotal: cartSubtotal,
                    discount: cartDiscount,
                    tax: cartTax,
                    rounding_diff: paymentMethod === 'cash' ? roundingDiff : 0,
                    total: cartTotal,
                    paid_amount: paymentMethod === 'debt' ? 0 : (paymentMethod === 'split' ? (Number(splitCashInput) + Number(splitTransferInput)) : paidAmount),
                    cash_amount: paymentMethod === 'split' ? Number(splitCashInput) : 0,
                    transfer_amount: paymentMethod === 'split' ? Number(splitTransferInput) : 0,
                    change_amount: changeAmount,
                    payment_method: paymentMethod,
                    customer: customerObj ? customerObj.name : 'Pelanggan Umum',
                    cashier: auth?.user?.name || 'Kasir',
                    earned_points: totalPointsEarned,
                    current_points: currentPointsBalance
                });

                clearCart();
                setShowSuccessModal(true);
                toast.success('Transaksi penjualan POS berhasil diproses!');
            },
            onError: (err) => {
                setIsSubmitting(false);
                const firstErr = Object.values(err)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Terjadi kesalahan saat memproses transaksi POS.');
            }
        });
    };

    const syncPendingTransactions = async () => {
        if (pendingTransactions.length === 0 || isOffline) {
return;
}
        
        setIsSyncing(true);
        let successCount = 0;
        let currentPending = [...pendingTransactions];

        for (const tx of pendingTransactions) {
            try {
                const response = await axios.post('/pos/checkout', {
                    ...tx,
                    // Inform the backend this is a forced offline sync to bypass rigid stock validations if needed
                    is_offline_sync: true,
                });
                
                // If successful, remove from pending array
                currentPending = currentPending.filter(p => p.id !== tx.id);
                successCount++;
            } catch (error: any) {
                console.error('Failed to sync offline transaction', tx.id, error);
                
                // If the error is an unprocessable entity (e.g. 422), we might want to flag it or handle it.
                // But for now, we keep it in the queue unless it's explicitly handled.
                // We could also force clear it if the backend returns a specific "cannot be processed" error.
            }
        }

        setPendingTransactions(currentPending);
        setIsSyncing(false);

        if (successCount > 0) {
            toast.success(`${successCount} transaksi offline berhasil disinkronisasi ke server!`);
            // Reload page data to get updated stock and transactions
            router.reload({ only: ['transactions', 'products'] });
        }
    };

    // Filter produk aktif berdasarkan kategori & pencarian kata kunci
    const categories = useMemo(() => {
        const unique = new Set(products.map(p => p.category));

        return ['Semua', ...Array.from(unique)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => {
            const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return {
        activeTab,
        setActiveTab,
        cart,
        setCart,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        txSearchQuery,
        setTxSearchQuery,
        txPaymentMethod,
        setTxPaymentMethod,
        txStatus,
        setTxStatus,
        txDateRange,
        setTxDateRange,
        filteredTransactions,
        isSuperAdmin,
        selectedCustomer,
        setSelectedCustomer,
        selectedPromo,
        setSelectedPromo,
        selectedDetailTransaction,
        setSelectedDetailTransaction,
        showDetailModal,
        setShowDetailModal,
        paymentMethod,
        setPaymentMethod,
        splitCashInput,
        setSplitCashInput,
        splitTransferInput,
        setSplitTransferInput,
        showPayDebtDialog,
        setShowPayDebtDialog,
        payDebtTransaction,
        setPayDebtTransaction,
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
        posSettings,
        setPosSettings,
        isPaymentExpanded,
        setIsPaymentExpanded,
        showSuccessModal,
        setShowSuccessModal,
        lastTransaction,
        setLastTransaction,
        isSubmitting,
        isSavingDb,
        drafts,
        setDrafts,
        draftNotes,
        setDraftNotes,
        showDraftModal,
        setShowDraftModal,
        selectedReturnTxId,
        setSelectedReturnTxId,
        returnItems,
        setReturnItems,
        isSubmittingReturn,
        categories,
        filteredProducts,
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
        handleManualDiscountChange,
        handleRedeemPointsChange,
        setQuickCash,
        handleSaveSettingsToDb,
        handleCheckout,
        handlePrintReceipt,
        handleDownloadReceiptImage,
        handleSendWhatsAppReceipt,
        handleReprint,
        handleSaveDraft,
        handleLoadDraft,
        handleDeleteDraft,
        handleReturnTxChange,
        handleReturnQtyChange,
        handleReturnQtyInputChange,
        handleProcessReturn,
        handlePaidAmountChange,
        handleSplitCashChange,
        handleSplitTransferChange,
        
        // Offline Sync States
        isOffline,
        pendingTransactions,
        isSyncing,
        syncPendingTransactions,
        loyaltySettings
    };
}

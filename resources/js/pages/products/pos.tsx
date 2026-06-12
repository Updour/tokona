import { Head } from '@inertiajs/react';
import { ShoppingCart, History, RefreshCw, Bookmark, WifiOff, CloudUpload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PayDebtDialog } from '@/features/pos/components/PayDebtDialog';
import { PosCartSidebar } from '@/features/pos/components/PosCartSidebar';
import { PosDetailTransactionDialog } from '@/features/pos/components/PosDetailTransactionDialog';
import { PosDraftNotesDialog } from '@/features/pos/components/PosDraftNotesDialog';
import { PosProductsGrid } from '@/features/pos/components/PosProductsGrid';
import { PosReceiptDialog } from '@/features/pos/components/PosReceiptDialog';
import { PosDraftsTab } from '@/features/pos/components/tabs/PosDraftsTab';
import { PosReturnsTab } from '@/features/pos/components/tabs/PosReturnsTab';
import { PosTransactionsTab } from '@/features/pos/components/tabs/PosTransactionsTab';
import { usePos } from '@/features/pos/services/usePos';
import { ShiftStatusBanner } from '@/features/shifts/components/ShiftStatusBanner';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Pos({ products, customers, promos, branches, transactions, defaultSettings, filters, activeShift, loyaltySettings }: any) {
    const pos = usePos({
        products,
        customers,
        promos,
        branches,
        transactions,
        defaultSettings,
        filters,
        loyaltySettings
    });

    return (
        <MainLayout>
            <Head title="Point of Sale (POS) - Tokona ERP" />

            {/* OFFLINE & SYNC BANNER */}
            {(pos.isOffline || pos.pendingTransactions.length > 0) && (
                <div className={`flex flex-col sm:flex-row items-center justify-between p-3 px-4 rounded-xl border mb-4 shadow-sm shrink-0 font-sans ${pos.isOffline ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <div className="flex items-center gap-3">
                        {pos.isOffline ? <WifiOff className="h-5 w-5 text-red-600" /> : <CloudUpload className="h-5 w-5 text-amber-600" />}
                        <div>
                            <p className="text-sm font-bold">
                                {pos.isOffline ? 'Koneksi Terputus (Mode Offline)' : 'Ada Transaksi Tertunda'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-90">
                                {pos.isOffline 
                                    ? `Transaksi akan disimpan lokal. Terdapat ${pos.pendingTransactions.length} transaksi dalam antrean.` 
                                    : `${pos.pendingTransactions.length} transaksi kasir offline belum dikirim ke server.`}
                            </p>
                        </div>
                    </div>
                    
                    {!pos.isOffline && pos.pendingTransactions.length > 0 && (
                        <button
                            onClick={pos.syncPendingTransactions}
                            disabled={pos.isSyncing}
                            className="mt-3 sm:mt-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {pos.isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                            {pos.isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}
                        </button>
                    )}
                </div>
            )}

            {/* TAB HEADER NAVIGASI MODERN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm mb-6 shrink-0 font-sans">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-800">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-800 tracking-tight">Point of Sale (POS)</h1>
                        <p className="text-xs text-slate-500 font-semibold">Kasir Pintar & Penjualan Tokona ERP</p>
                    </div>
                </div>

                {/* PILIHAN MENU SUB-TAB POS */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => pos.setActiveTab('cashier')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pos.activeTab === 'cashier'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Kasir
                    </button>
                    <button
                        onClick={() => pos.setActiveTab('transactions')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pos.activeTab === 'transactions'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <History className="h-3.5 w-3.5" />
                        Daftar Transaksi
                    </button>
                    <button
                        onClick={() => pos.setActiveTab('returns')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pos.activeTab === 'returns'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retur Penjualan
                    </button>
                    <button
                        onClick={() => pos.setActiveTab('drafts')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pos.activeTab === 'drafts'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Bookmark className="h-3.5 w-3.5" />
                        Draft / Pending
                        {pos.drafts.length > 0 && (
                            <Badge className="bg-amber-500 text-white border-0 text-[10px] font-black h-4 px-1 shrink-0">
                                {pos.drafts.length}
                            </Badge>
                        )}
                    </button>
                </div>
            </div>

            {/* KONTEN BERDASARKAN TAB AKTIF */}
            <div className="h-[calc(100vh-210px)] overflow-hidden">
                {/* TAB 1: KASIR UTAMA */}
                {pos.activeTab === 'cashier' && (
                    !activeShift && (pos.posSettings.require_shift ?? true) ? (
                        <div className="flex items-center justify-center h-full w-full bg-slate-50 rounded-xl p-8 border">
                            <ShiftStatusBanner />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full overflow-hidden">
                            <PosProductsGrid
                                products={products}
                                categories={pos.categories}
                                selectedCategory={pos.selectedCategory}
                                setSelectedCategory={pos.setSelectedCategory}
                                searchQuery={pos.searchQuery}
                                setSearchQuery={pos.setSearchQuery}
                                filteredProducts={pos.filteredProducts}
                                handleAddToCart={pos.handleAddToCart}
                                posSettings={pos.posSettings}
                                setPosSettings={pos.setPosSettings}
                                handleSaveSettingsToDb={pos.handleSaveSettingsToDb}
                                isSavingDb={pos.isSavingDb}
                            />

                            <PosCartSidebar
                                cart={pos.cart}
                                updateQty={pos.updateQty}
                                handleQtyInputChange={pos.handleQtyInputChange}
                                handleQtyInputBlur={pos.handleQtyInputBlur}
                                handleRemoveFromCart={pos.handleRemoveFromCart}
                                selectedCustomer={pos.selectedCustomer}
                                setSelectedCustomer={pos.setSelectedCustomer}
                                customers={customers}
                                selectedPromo={pos.selectedPromo}
                                setSelectedPromo={pos.setSelectedPromo}
                                promos={promos}
                                isPaymentExpanded={pos.isPaymentExpanded}
                                setIsPaymentExpanded={pos.setIsPaymentExpanded}
                                cartTotal={pos.cartTotal}
                                cartSubtotal={pos.cartSubtotal}
                                cartDiscount={pos.cartDiscount}
                                manualDiscountInput={pos.manualDiscountInput}
                                handleManualDiscountChange={pos.handleManualDiscountChange}
                                redeemPointsInput={pos.redeemPointsInput}
                                handleRedeemPointsChange={pos.handleRedeemPointsChange}
                                posSettings={pos.posSettings}
                                roundingDiff={pos.roundingDiff}
                                cartTax={pos.cartTax}
                                paymentMethod={pos.paymentMethod}
                                setPaymentMethod={pos.setPaymentMethod}
                                splitCashInput={pos.splitCashInput}
                                handleSplitCashChange={pos.handleSplitCashChange}
                                splitTransferInput={pos.splitTransferInput}
                                handleSplitTransferChange={pos.handleSplitTransferChange}
                                paidAmountInput={pos.paidAmountInput}
                                handlePaidAmountChange={pos.handlePaidAmountChange}
                                setQuickCash={pos.setQuickCash}
                                changeAmount={pos.changeAmount}
                                handleCheckout={pos.handleCheckout}
                                isSubmitting={pos.isSubmitting}
                                setShowDraftModal={pos.setShowDraftModal}
                                loyaltySettings={pos.loyaltySettings}
                            />
                        </div>
                    )
                )}

                {/* TAB 2: DAFTAR TRANSAKSI (RIWAYAT KASIR) */}
                {pos.activeTab === 'transactions' && (
                    <PosTransactionsTab
                        transactions={transactions}
                        setSelectedDetailTransaction={pos.setSelectedDetailTransaction}
                        setShowDetailModal={pos.setShowDetailModal}
                        handleReprint={pos.handleReprint}
                        setPayDebtTransaction={pos.setPayDebtTransaction}
                        setShowPayDebtDialog={pos.setShowPayDebtDialog}
                    />
                )}

                {/* TAB 3: RETUR PENJUALAN (SALES RETURN) */}
                {pos.activeTab === 'returns' && (
                    <PosReturnsTab
                        transactions={transactions}
                        selectedReturnTxId={pos.selectedReturnTxId}
                        handleReturnTxChange={pos.handleReturnTxChange}
                        returnItems={pos.returnItems}
                        handleReturnQtyChange={pos.handleReturnQtyChange}
                        handleReturnQtyInputChange={pos.handleReturnQtyInputChange}
                        handleProcessReturn={pos.handleProcessReturn}
                        isSubmittingReturn={pos.isSubmittingReturn}
                    />
                )}

                {/* TAB 4: DRAFT / PENDING ORDERS */}
                {pos.activeTab === 'drafts' && (
                    <PosDraftsTab
                        drafts={pos.drafts}
                        handleDeleteDraft={pos.handleDeleteDraft}
                        handleLoadDraft={pos.handleLoadDraft}
                    />
                )}
            </div>

            {/* MODAL DIALOGS */}
            <PosReceiptDialog
                open={pos.showSuccessModal}
                onOpenChange={pos.setShowSuccessModal}
                lastTransaction={pos.lastTransaction}
                handlePrintReceipt={pos.handlePrintReceipt}
                handleDownloadReceiptImage={pos.handleDownloadReceiptImage}
                handleSendWhatsAppReceipt={pos.handleSendWhatsAppReceipt}
            />

            <PosDraftNotesDialog
                open={pos.showDraftModal}
                onOpenChange={pos.setShowDraftModal}
                draftNotes={pos.draftNotes}
                setDraftNotes={pos.setDraftNotes}
                handleSaveDraft={pos.handleSaveDraft}
            />

            <PosDetailTransactionDialog
                open={pos.showDetailModal}
                onOpenChange={pos.setShowDetailModal}
                selectedDetailTransaction={pos.selectedDetailTransaction}
                branches={branches}
                isSuperAdmin={pos.isSuperAdmin}
                handleReprint={pos.handleReprint}
            />

            <PayDebtDialog
                isOpen={pos.showPayDebtDialog}
                onClose={() => {
                    pos.setShowPayDebtDialog(false);
                    pos.setPayDebtTransaction(null);
                }}
                transaction={pos.payDebtTransaction}
            />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #receipt-print-area, #receipt-print-area * {
                        visibility: visible;
                    }
                    #receipt-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-height: none !important;
                        overflow: visible !important;
                        border: none !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        font-size: 14px !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}

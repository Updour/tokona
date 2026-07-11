import { Tag, Sparkles, Calculator, Wallet, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah, formatNumber } from '@/lib/helpers/format';

interface PosPaymentPanelProps {
    cart: any[];
    selectedCustomer: string;
    customers: any[];
    selectedPromo: string | null;
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
    loyaltySettings?: any;
    onBackToCart?: () => void;
    isMobileTabMode?: boolean;
}

export function PosPaymentPanel({
    cart,
    selectedCustomer,
    customers,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    manualDiscountInput,
    handleManualDiscountChange,
    redeemPointsInput,
    handleRedeemPointsChange,
    posSettings,
    roundingDiff,
    cartTax,
    paymentMethod,
    setPaymentMethod,
    splitCashInput,
    handleSplitCashChange,
    splitTransferInput,
    handleSplitTransferChange,
    paidAmountInput,
    handlePaidAmountChange,
    setQuickCash,
    changeAmount,
    dueDate,
    setDueDate,
    handleCheckout,
    isSubmitting,
    loyaltySettings,
    onBackToCart,
    isMobileTabMode = false
}: PosPaymentPanelProps) {
    const selectedCustomerObj = customers.find(c => c.id === selectedCustomer);
    const paidAmountNum = parseFloat(paidAmountInput.replace(/[^0-9]/g, '')) || 0;

    const isPaymentValid = () => {
        if (paymentMethod === 'debt') return !!dueDate;
        if (paymentMethod === 'split') {
            const splitCash = parseFloat(splitCashInput) || 0;
            const splitTransfer = parseFloat(splitTransferInput) || 0;
            return (splitCash + splitTransfer) >= cartTotal;
        }
        const parsedPaidAmount = parseFloat(paidAmountInput.replace(/[^0-9]/g, '')) || 0;
        return parsedPaidAmount >= cartTotal;
    };

    return (
        <div className="flex flex-col bg-white overflow-hidden h-full flex-1 w-full">
            {/* Header Pembayaran */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                    {onBackToCart && (
                        <Button
                            onClick={onBackToCart}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 border border-slate-700 bg-slate-800/60 rounded-full mr-1 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <span className="text-sm font-black tracking-wide">Detail Pembayaran</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">TOTAL TAGIHAN</span>
                    <span className="font-mono text-lg font-black text-white">{formatRupiah(cartTotal)}</span>
                </div>
            </div>

            {/* Rincian Harga & Diskon (Scrollable jika layar sempit) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                <div className="space-y-2 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-slate-500 font-bold">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatRupiah(cartSubtotal)}</span>
                    </div>

                    {cartDiscount > 0 && (
                        <div className="flex justify-between text-red-600 font-bold">
                            <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Total Diskon
                            </span>
                            <span className="font-mono">- {formatRupiah(cartDiscount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-slate-500 font-bold gap-3 py-1 border-y border-dashed border-slate-200">
                        <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-amber-500" /> Diskon Manual
                        </span>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            className="h-7 w-28 text-right font-mono font-bold text-xs border-slate-200 focus-visible:ring-slate-900 bg-white rounded-md shadow-sm"
                            value={manualDiscountInput ? formatRupiah(manualDiscountInput) : ''}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                handleManualDiscountChange(raw);
                            }}
                        />
                    </div>

                    {selectedCustomer !== 'umum' && (
                        <div className="flex justify-between items-center text-slate-500 font-bold gap-3 py-1 border-b border-dashed border-slate-200">
                            <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-indigo-500" /> Pakai Poin
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                    (Maks: {selectedCustomerObj?.points || 0})
                                </span>
                            </span>
                            <Input
                                type="text"
                                placeholder="0"
                                className="h-7 w-28 text-right font-mono font-bold text-xs border-indigo-200 focus-visible:ring-indigo-500 bg-indigo-50 rounded-md shadow-sm"
                                value={redeemPointsInput}
                                onChange={(e) => handleRedeemPointsChange(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex justify-between text-slate-500 font-bold">
                        <span>PPN ({posSettings.taxEnabled ? `${posSettings.taxRate}%` : 'Nonaktif'})</span>
                        <span className="font-mono">{formatRupiah(cartTax)}</span>
                    </div>

                    {paymentMethod === 'cash' && Math.abs(roundingDiff) > 0 && (
                        <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-slate-200">
                            <span className="text-amber-600 flex items-center gap-1">
                                <Calculator className="h-3.5 w-3.5 text-amber-500" />
                                Pembulatan Tunai {roundingDiff < 0 ? '(Diskon Koin)' : ''}
                            </span>
                            <span className={roundingDiff < 0 ? 'text-emerald-600 font-mono font-black' : 'text-rose-600 font-mono font-black'}>
                                {roundingDiff > 0 ? '+' : ''}{formatRupiah(roundingDiff)}
                            </span>
                        </div>
                    )}

                    {paymentMethod !== 'debt' && (
                        <div className={`flex justify-between items-center transition-all duration-200 ${changeAmount > 0
                            ? 'bg-emerald-600 text-white px-3 py-2 rounded-xl border border-emerald-700 shadow-sm mt-2 scale-[1.01]'
                            : 'pt-2 mt-1 border-t border-dashed border-slate-200 text-slate-500'
                            }`}>
                            <span className={`font-bold text-xs ${changeAmount > 0 ? 'text-emerald-100' : ''}`}>Uang Kembalian</span>
                            <span className={`font-mono font-black ${changeAmount > 0 ? 'text-white text-base' : 'font-extrabold'}`}>{formatRupiah(changeAmount)}</span>
                        </div>
                    )}
                </div>

                {/* Pilihan Metode Pembayaran */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['cash', 'transfer', 'debt', 'split'].map((method) => {
                            if (method === 'split' && (!posSettings.activeMethods?.cash || !posSettings.activeMethods?.transfer)) {
                                return null;
                            }

                            if (method !== 'split' && posSettings.activeMethods && !posSettings.activeMethods[method]) {
                                return null;
                            }

                            const isSelected = paymentMethod === method;
                            const labels: any = {
                                cash: 'Tunai',
                                transfer: 'Transfer/QRIS',
                                debt: 'Hutang',
                                split: 'Split Bayar'
                            };

                            return (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method as any)}
                                    className={`py-2 rounded-lg text-xs font-black border transition-all ${isSelected
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                >
                                    {labels[method]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form Input Detail Sesuai Metode */}
                {paymentMethod === 'split' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 font-bold text-xs">Rp Tunai</span>
                                </div>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={splitCashInput ? formatNumber(splitCashInput) : ''}
                                    onChange={(e) => handleSplitCashChange(e.target.value)}
                                    className="pl-16 h-12 text-xs font-bold placeholder:font-normal bg-white rounded-xl border-2 border-slate-900 focus-visible:ring-slate-900"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 font-bold text-xs">Rp Trf</span>
                                </div>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={splitTransferInput ? formatNumber(splitTransferInput) : ''}
                                    onChange={(e) => handleSplitTransferChange(e.target.value)}
                                    className="pl-14 h-12 text-xs font-bold placeholder:font-normal bg-white rounded-xl border-2 border-slate-900 focus-visible:ring-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {paymentMethod === 'debt' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">DP (Tunai)</label>
                                <div className="relative">
                                    <Input
                                        id="pos-paid-amount-input-debt"
                                        type="text"
                                        placeholder="0"
                                        className="h-10 px-3 text-xs font-black border-slate-200 rounded-lg font-mono text-slate-900 focus-visible:ring-blue-500 shadow-sm bg-white"
                                        value={paidAmountInput ? formatRupiah(paidAmountInput) : ''}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            handlePaidAmountChange(raw);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-red-500 uppercase tracking-wider block px-1">Jatuh Tempo*</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-10 px-2 text-xs font-bold border-red-200 focus-visible:ring-red-500 focus-visible:border-red-500 shadow-sm bg-red-50/50 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            <span>Sisa Piutang:</span>
                            <span className="font-mono text-xs">{formatRupiah(Math.max(0, cartTotal - paidAmountNum))}</span>
                        </div>
                    </div>
                )}

                {paymentMethod !== 'debt' && paymentMethod !== 'split' && (
                    <div className="space-y-3">
                        {/* Quick Cash Buttons */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            <Button
                                type="button"
                                onClick={() => setQuickCash(cartTotal)}
                                className={`h-8 px-3 text-[10px] font-black tracking-wide rounded-lg transition-all shrink-0 active:scale-[0.96] flex items-center gap-1 border shadow-sm ${paidAmountNum === cartTotal
                                    ? 'bg-slate-900 hover:bg-slate-950 border-slate-900 text-white'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                            >
                                <Wallet className="h-3 w-3" />
                                <span>UANG PAS</span>
                            </Button>

                            <div className="w-px h-5 bg-slate-200 shrink-0 mx-0.5"></div>

                            {[10000, 20000, 50000, 100000, 500000, 1000000].map((amt) => {
                                const isActive = paidAmountNum === amt;
                                return (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setQuickCash(amt)}
                                        className={`h-8 px-2.5 text-[10px] font-black rounded-lg font-mono transition-all active:scale-[0.95] shadow-sm flex items-center justify-center border ${isActive
                                            ? 'bg-slate-900 hover:bg-slate-950 border-slate-900 text-white'
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                    >
                                        +{formatNumber(amt)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Received & Change inputs */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                                Nominal Uang Diterima
                            </label>
                            <Input
                                id="pos-paid-amount-input"
                                type="text"
                                placeholder="Rp 0"
                                className="h-10 px-3 text-sm font-mono font-black border-slate-200 rounded-lg text-slate-900 focus-visible:ring-blue-500 shadow-sm bg-white"
                                value={paidAmountInput ? formatRupiah(paidAmountInput) : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    handlePaidAmountChange(raw);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Fast Checkout CTA footer */}
            <div className="p-4 border-t bg-slate-50 shrink-0">
                <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isSubmitting || !isPaymentValid()}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-950 text-white font-black text-base gap-2 rounded-xl shadow-lg transition-all active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Memproses Checkout...' : 'PROSES TRANSAKSI'}
                </Button>
            </div>
        </div>
    );
}

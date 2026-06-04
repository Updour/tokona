import { ShoppingCart, Receipt, Minus, Plus, Trash2, ChevronDown, Tag, Sparkles, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/helpers/format';

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
    handleCheckout: () => void;
    isSubmitting: boolean;
    setShowDraftModal: (show: boolean) => void;
}

export function PosCartSidebar({
    cart,
    updateQty,
    handleQtyInputChange,
    handleQtyInputBlur,
    handleRemoveFromCart,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    selectedPromo,
    setSelectedPromo,
    promos,
    isPaymentExpanded,
    setIsPaymentExpanded,
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
    handleCheckout,
    isSubmitting,
    setShowDraftModal
}: PosCartSidebarProps) {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    return (
        <div className="xl:col-span-5 flex flex-col bg-white rounded-2xl border shadow-md overflow-hidden h-full">
            {/* Header Keranjang */}
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-slate-700" />
                    <span className="text-sm font-black text-slate-800">Keranjang Kasir</span>
                </div>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                        <Button
                            onClick={() => setShowDraftModal(true)}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-slate-700 bg-slate-100 border-0 font-bold hover:bg-slate-200"
                        >
                            Tahan Order
                        </Button>
                    )}
                    <Badge className="text-xs px-2.5 py-1 font-black text-white bg-slate-900 border-slate-900 shadow-sm shrink-0">
                        {totalQty} Barang
                    </Badge>
                </div>
            </div>

            {/* Member & Customer Selector */}
            <div className="p-4 border-b grid grid-cols-2 gap-3 bg-slate-50/20 shrink-0">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pelanggan (Member)
                    </label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger className="w-full h-9 text-xs bg-white mt-1 border-slate-200">
                            <SelectValue placeholder="Pilih Pelanggan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="umum">Pelanggan Umum (Tunai)</SelectItem>
                            {customers.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name} ({c.tier})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Promo / Voucher
                    </label>
                    <Select
                        value={selectedPromo || 'NO_PROMO'}
                        onValueChange={(val) => setSelectedPromo(val === 'NO_PROMO' ? null : val)}
                    >
                        <SelectTrigger className="w-full h-9 text-xs bg-white mt-1 border-slate-200">
                            <SelectValue placeholder="Terapkan Voucher" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NO_PROMO">Tidak Ada Voucher</SelectItem>
                            {promos.map((pr: any) => {
                                const text = pr.type === 'percentage' ? `${pr.name} (${pr.value}%)` : `${pr.name} (Rp ${parseFloat(pr.value).toLocaleString()})`;

                                return (
                                    <SelectItem key={pr.id} value={pr.id}>
                                        {text}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List Item Keranjang */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0 divide-y divide-slate-100">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-slate-400 py-10">
                        <Receipt className="h-12 w-12 text-slate-300 mb-2" />
                        <span className="text-xs font-semibold">Keranjang kasir masih kosong.</span>
                    </div>
                ) : (
                    cart.map((item: any) => (
                        <div key={item.id} className="py-3 flex justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-slate-800 truncate">{item.name}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                                    {item.sku}
                                </span>
                                <span className="text-xs font-bold text-slate-700 mt-1 block">
                                    {formatRupiah(item.price)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center border rounded-lg bg-slate-50 p-0.5">
                                    <Button
                                        onClick={() => updateQty(item.id, -1)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-md hover:bg-white text-slate-500"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <input
                                        type="text"
                                        value={item.qty === 0 ? '' : item.qty}
                                        onChange={(e) => handleQtyInputChange(item.id, e.target.value)}
                                        onBlur={() => handleQtyInputBlur(item.id, item.qty)}
                                        className="text-xs font-black w-8 text-center text-slate-700 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none font-mono"
                                    />
                                    <Button
                                        onClick={() => updateQty(item.id, 1)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-md hover:bg-white text-slate-500"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => handleRemoveFromCart(item.id, item.name)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ringkasan & Panel Checkout */}
            <div className="bg-slate-50 shrink-0 flex flex-col p-4 space-y-3 z-20 border-t border-slate-200/60 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative">
                {/* Clickable Accordion Header Bar */}
                <div
                    onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                    className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-pointer hover:from-slate-950 hover:to-slate-900 transition-all select-none shrink-0 rounded-xl shadow-lg ring-1 ring-slate-950/5 relative z-20"
                >
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider block mb-0.5">TOTAL TAGIHAN</span>
                        <span className="font-mono text-lg font-black text-white">{formatRupiah(cartTotal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                        <span>{isPaymentExpanded ? 'Tutup Detail' : 'Bayar'}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isPaymentExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {/* Accordion Content Body (Floating Over Cart) */}
                {isPaymentExpanded && (
                    <div className="absolute bottom-[calc(100%-25px)] left-0 right-0 p-4 pt-4 pb-10 border-t border-x border-slate-200 rounded-t-2xl space-y-4 bg-white/95 backdrop-blur-md shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.15)] max-h-[420px] overflow-y-auto z-10">
                        <div className="space-y-1.5 text-xs">
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
                                    <Tag className="h-3 w-3 text-amber-500" /> Diskon Manual (Rp)
                                </span>
                                <Input
                                    type="text"
                                    placeholder="0"
                                    className="h-7 w-28 text-right font-mono font-bold text-xs border-slate-250 focus-visible:ring-slate-900 bg-white rounded-md shadow-sm"
                                    value={manualDiscountInput}
                                    onChange={(e) => handleManualDiscountChange(e.target.value)}
                                />
                            </div>

                            {selectedCustomer !== 'umum' && (
                                <div className="flex justify-between items-center text-slate-500 font-bold gap-3 py-1 border-b border-dashed border-slate-200">
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-indigo-500" /> Pakai Poin
                                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                                            (Maks: {customers.find((c: any) => c.id === selectedCustomer)?.points || 0})
                                        </span>
                                    </span>
                                    <Input
                                        type="text"
                                        placeholder="0"
                                        className="h-7 w-28 text-right font-mono font-bold text-xs border-indigo-250 focus-visible:ring-indigo-500 bg-indigo-50 rounded-md shadow-sm"
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
                                <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-slate-100">
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <Calculator className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                        Pembulatan Tunai {roundingDiff < 0 ? '(Diskon Koin)' : ''}
                                    </span>
                                    <span className={roundingDiff < 0 ? 'text-emerald-600 font-mono font-black' : 'text-rose-600 font-mono font-black'}>
                                        {roundingDiff > 0 ? '+' : ''}{formatRupiah(roundingDiff)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {['cash', 'transfer', 'debt', 'split'].map((method) => {
                                if (method === 'split' && (!posSettings.activeMethods?.cash || !posSettings.activeMethods?.transfer)) return null;
                                if (method !== 'split' && posSettings.activeMethods && !posSettings.activeMethods[method]) return null;

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
                                        className={`py-2 rounded-lg text-[11px] font-black border transition-all ${isSelected
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                    >
                                        {labels[method]}
                                    </button>
                                );
                            })}
                        </div>

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
                                            value={splitCashInput ? Number(splitCashInput).toLocaleString('id-ID') : ''}
                                            onChange={(e) => handleSplitCashChange(e.target.value)}
                                            className="pl-20 h-14 text-sm font-bold placeholder:font-normal bg-white rounded-xl border-2 border-slate-900 focus-visible:ring-slate-900"
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
                                            value={splitTransferInput ? Number(splitTransferInput).toLocaleString('id-ID') : ''}
                                            onChange={(e) => handleSplitTransferChange(e.target.value)}
                                            className="pl-16 h-14 text-sm font-bold placeholder:font-normal bg-white rounded-xl border-2 border-slate-900 focus-visible:ring-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod !== 'debt' && paymentMethod !== 'split' && (
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-3.5 text-base font-black text-slate-400">Rp</span>
                                        <Input
                                            type="text"
                                            placeholder="0"
                                            className="pl-11 h-14 text-xl font-black border-2 border-slate-900 rounded-xl font-mono text-slate-900 focus-visible:ring-slate-900 shadow-sm focus:border-slate-900 bg-white"
                                            value={paidAmountInput}
                                            onChange={(e) => handlePaidAmountChange(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setQuickCash(cartTotal)}
                                        variant="outline"
                                        className="text-xs h-14 px-4 font-black border-2 border-slate-900 bg-slate-900 hover:bg-slate-950 text-white rounded-xl shadow-sm transition-all shrink-0"
                                    >
                                        Uang Pas
                                    </Button>
                                </div>

                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {[10000, 20000, 50000, 100000, 200000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setQuickCash(amt)}
                                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-[10px] font-black rounded-md text-slate-650 shrink-0 font-mono"
                                        >
                                            +{amt.toLocaleString('id-ID')}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center p-3 bg-emerald-50 border-2 border-emerald-250/50 rounded-xl text-emerald-800">
                                    <span className="text-xs font-black">UANG KEMBALIAN</span>
                                    <span className="font-mono text-base font-black">{formatRupiah(changeAmount)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fast Checkout CTA footer */}
                <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isSubmitting}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-950 text-white font-black text-base gap-2 rounded-xl shadow-lg transition-all active:scale-[0.98] shrink-0"
                >
                    {isSubmitting ? 'Memproses Checkout...' : 'PROSES TRANSAKSI'}
                </Button>
            </div>
        </div>
    );
}

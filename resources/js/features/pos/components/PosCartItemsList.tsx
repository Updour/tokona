import { ShoppingCart, Receipt, Minus, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah, formatNumber } from '@/lib/helpers/format';

interface PosCartItemsListProps {
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
    setShowDraftModal: (show: boolean) => void;
    loyaltySettings?: any;
    onProceedToPayment?: () => void;
    isMobileTabMode?: boolean;
    cartTotal?: number;
}

export function PosCartItemsList({
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
    setShowDraftModal,
    loyaltySettings,
    onProceedToPayment,
    isMobileTabMode = false,
    cartTotal = 0
}: PosCartItemsListProps) {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const selectedCustomerObj = customers.find(c => c.id === selectedCustomer);
    const currentPoints = selectedCustomerObj?.points || 0;

    return (
        <div className="flex flex-col bg-white overflow-hidden h-full flex-1 w-full">
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
            <div className="p-3 border-b grid grid-cols-2 gap-3 bg-slate-50/20 shrink-0">
                <div className="flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-1.5 min-h-[16px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                            Pelanggan
                        </label>
                        {selectedCustomerObj && currentPoints > 0 && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded-sm whitespace-nowrap ml-1 shrink-0">
                                {formatNumber(currentPoints)} Ptn
                            </span>
                        )}
                    </div>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
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

                <div className="flex flex-col justify-end">
                    <div className="flex items-center mb-1.5 min-h-[16px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                            Promo / Voucher
                        </label>
                    </div>
                    <Select
                        value={selectedPromo || 'NO_PROMO'}
                        onValueChange={(val) => setSelectedPromo(val === 'NO_PROMO' ? null : val)}
                    >
                        <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                            <SelectValue placeholder="Terapkan Voucher" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NO_PROMO">Tidak Ada Voucher</SelectItem>
                            {promos.map((pr: any) => {
                                const text = pr.type === 'percentage' ? `${pr.name} (${pr.value}%)` : `${pr.name} (Rp ${formatNumber(pr.value)})`;

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

            {/* Bottom Checkout CTA */}
            {cart.length > 0 && onProceedToPayment && (
                <div className="p-4 border-t bg-slate-50 shrink-0">
                    <Button
                        onClick={onProceedToPayment}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-950 text-white font-black text-sm gap-2 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                    >
                        Pilih Pembayaran ({formatRupiah(cartTotal)})
                    </Button>
                </div>
            )}
        </div>
    );
}

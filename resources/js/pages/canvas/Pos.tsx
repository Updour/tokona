import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ShoppingCart, ArrowLeft, Plus, Minus, Search, PackageX, Banknote, CreditCard, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/helpers/format';
import { toast } from 'sonner';

export default function CanvasPos({ sales, visit, loadedStocks }: any) {
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash'|'qris'|'transfer'>('cash');

    const filteredStocks = loadedStocks.filter((s: any) => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.sku.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.product_id === product.product_id);
        if (existing) {
            if (existing.qty >= product.current_stock) {
                toast.error('Maksimal stok tercapai!');
                return;
            }
            setCart(cart.map(item => 
                item.product_id === product.product_id 
                    ? { ...item, qty: item.qty + 1 } 
                    : item
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const stockItem = loadedStocks.find((s: any) => s.product_id === productId);
                const newQty = item.qty + delta;
                if (newQty < 1) return item;
                if (stockItem && newQty > stockItem.current_stock) {
                    toast.error('Maksimal stok tercapai!');
                    return item;
                }
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        router.post('/canvas/checkout', {
            sales_visit_id: visit.id,
            customer_id: visit.customer_id,
            items: cart.map(c => ({ product_id: c.product_id, qty: c.qty, price: c.price })),
            payment_method: paymentMethod,
            amount_paid: totalAmount,
        }, {
            onSuccess: () => {
                toast.success('Pesanan berhasil dibuat!');
                // Redirects back automatically or we handle it in controller
                // Usually controller responds with JSON so Inertia needs to be handled
                router.get('/canvas');
            },
            onError: (errors) => {
                toast.error(errors.message || 'Gagal membuat pesanan');
                setIsProcessing(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Head title="Canvas Kasir" />

            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="bg-white p-4 border-b flex items-center gap-4 shrink-0 shadow-sm z-10">
                    <Link href="/canvas" className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0">
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Link>
                    <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari produk di kendaraan..." 
                            className="w-full bg-slate-100 border-transparent rounded-xl pl-9 text-sm h-10 focus:border-indigo-500 focus:ring-indigo-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                        Stok di Kendaraan <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">{filteredStocks.length} Item</Badge>
                    </h2>
                    
                    {filteredStocks.length === 0 ? (
                        <div className="text-center py-12">
                            <PackageX className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500">Tidak ada produk ditemukan di kendaraan Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {filteredStocks.map((stock: any) => (
                                <div 
                                    key={stock.product_id} 
                                    onClick={() => addToCart(stock)}
                                    className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm cursor-pointer hover:border-indigo-500 transition-all group"
                                >
                                    <div className="aspect-square bg-slate-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                                        {stock.image ? (
                                            <img src={`/storage/${stock.image}`} alt={stock.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <PackageX className="h-8 w-8 text-slate-300" />
                                        )}
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1 leading-snug">{stock.name}</h3>
                                    <div className="flex justify-between items-end mt-2">
                                        <p className="text-xs font-black text-indigo-650">{formatRupiah(stock.price)}</p>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Sisa: {stock.current_stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart & Checkout (Bottom sheet on mobile) */}
            <div className="w-full md:w-[380px] bg-white border-l shadow-xl flex flex-col h-[60vh] md:h-screen fixed md:relative bottom-0 z-20">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-sm font-black text-slate-800">Keranjang Canvas</h2>
                        <p className="text-[10px] font-semibold text-slate-500 line-clamp-1">{visit.customer.name}</p>
                    </div>
                    <Badge className="bg-indigo-650 font-black">{cart.length} Item</Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-xs font-semibold">Keranjang masih kosong</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product_id} className="flex gap-3 items-center border-b pb-3 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                                    <p className="text-[10px] font-semibold text-indigo-650 mt-0.5">{formatRupiah(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
                                    <button onClick={() => item.qty > 1 ? updateQty(item.product_id, -1) : removeFromCart(item.product_id)} className="h-6 w-6 bg-white rounded flex items-center justify-center shadow-sm text-slate-600 hover:text-rose-600">
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.product_id, 1)} className="h-6 w-6 bg-white rounded flex items-center justify-center shadow-sm text-slate-600 hover:text-indigo-600">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50 shrink-0">
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Metode Pembayaran</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setPaymentMethod('cash')}
                                className={`text-xs py-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-colors ${paymentMethod === 'cash' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Banknote className="h-4 w-4" /> Tunai
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('qris')}
                                className={`text-xs py-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-colors ${paymentMethod === 'qris' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <CreditCard className="h-4 w-4" /> QRIS
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('transfer')}
                                className={`text-xs py-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-colors ${paymentMethod === 'transfer' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Banknote className="h-4 w-4" /> Transfer
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-4">
                        <p className="text-sm font-semibold text-slate-500">Total Tagihan</p>
                        <p className="text-2xl font-black text-slate-800">{formatRupiah(totalAmount)}</p>
                    </div>

                    <Button 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full h-12 text-sm font-black bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-650/20"
                    >
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
                        ) : (
                            'Buat Faktur Canvas'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

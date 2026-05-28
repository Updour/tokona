import { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search,
    ShoppingCart,
    User,
    Percent,
    Calculator,
    Receipt,
    Trash2,
    Plus,
    Minus,
    CheckCircle2,
    Printer,
    Tag,
    Sparkles,
    AlertCircle,
    History,
    RefreshCw,
    Bookmark,
    FolderOpen,
    Clock,
    Undo2,
    Calendar,
    ChevronRight,
    Settings,
    ChevronDown,
    Share2,
    Download
} from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function Pos({ products, customers, promos, branches, transactions, defaultSettings, filters }: any) {
    // State Tab Aktif ('cashier' | 'transactions' | 'returns' | 'drafts')
    const [activeTab, setActiveTab] = useState<string>('cashier');

    // Sinkronisasi Tab dari URL Query parameter ?tab=
    useEffect(() => {
        if (filters?.tab) {
            setActiveTab(filters.tab);
        }
    }, [filters?.tab]);

    // State Keranjang POS Utama
    const [cart, setCart] = useState<any[]>([]);

    // State Filter & Pencarian Produk
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    // State Filter & Pencarian Riwayat Transaksi Kasir
    const [txSearchQuery, setTxSearchQuery] = useState('');
    const [txPaymentMethod, setTxPaymentMethod] = useState('all');
    const [txStatus, setTxStatus] = useState('all');
    const [txDateRange, setTxDateRange] = useState('all');

    // Filter Riwayat Transaksi Penjualan Kasir secara Dinamis & Responsif
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx: any) => {
            // 1. Filter Pencarian (Invoice / Nama Pelanggan)
            const matchesSearch =
                tx.invoice_number.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
                (tx.customer?.name ?? 'pelanggan umum').toLowerCase().includes(txSearchQuery.toLowerCase());

            // 2. Filter Metode Pembayaran
            const matchesPayment = txPaymentMethod === 'all' || tx.payment_method === txPaymentMethod;

            // 3. Filter Status
            const matchesStatus = txStatus === 'all' || tx.status === txStatus;

            // 4. Filter Rentang Waktu (Tanggal)
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

    // Ambil Data Auth & Peranan User
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth?.user?.is_super_admin || auth?.user?.role === 'super-admin';

    // State Pembayaran & Transaksi
    const [selectedCustomer, setSelectedCustomer] = useState('umum');
    const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

    // State Detail Transaksi untuk Modal
    const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'debt'>('cash');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paidAmountInput, setPaidAmountInput] = useState<string>('');
    const [manualDiscount, setManualDiscount] = useState<number>(0);
    const [manualDiscountInput, setManualDiscountInput] = useState<string>('');

    // State Pengaturan Kasir POS (Pajak PPN & Metode Pembayaran Dinamis)
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

    // State Akordeon Panel Pembayaran (Meningkatkan Kapasitas Daftar Barang)
    const [isPaymentExpanded, setIsPaymentExpanded] = useState<boolean>(false);

    // Load POS Settings dari Database (Inertia Prop) dengan Fallback LocalStorage
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
                // Keep default settings
            }
        }
    }, [defaultSettings]);

    // Set metode pembayaran pertama yang aktif secara dinamis jika metode saat ini dinonaktifkan
    useEffect(() => {
        if (posSettings.activeMethods && !posSettings.activeMethods[paymentMethod]) {
            const activeKeys = Object.keys(posSettings.activeMethods).filter(k => posSettings.activeMethods[k]);
            if (activeKeys.length > 0) {
                setPaymentMethod(activeKeys[0] as any);
            }
        }
    }, [posSettings, paymentMethod]);

    // State Modal Sukses & Cetak Struk
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDb, setIsSavingDb] = useState(false);

    // State Draft / Pending Order (LocalStorage)
    const [drafts, setDrafts] = useState<any[]>([]);
    const [draftNotes, setDraftNotes] = useState('');
    const [showDraftModal, setShowDraftModal] = useState(false);

    // State Retur Penjualan
    const [selectedReturnTxId, setSelectedReturnTxId] = useState<string>('select');
    const [returnItems, setReturnItems] = useState<any[]>([]);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

    // Load Draft dari LocalStorage saat inisialisasi
    useEffect(() => {
        const stored = localStorage.getItem('tokona_pos_drafts');
        if (stored) {
            try {
                setDrafts(JSON.parse(stored));
            } catch (e) {
                setDrafts([]);
            }
        }
    }, []);

    // Kategori produk secara dinamis dari data produk
    const categories = useMemo<string[]>(() => {
        const unique = Array.from(new Set(products.map((p: any) => p.category))) as string[];
        return ['Semua', ...unique];
    }, [products]);

    // Filter Produk Berdasarkan Kategori & Pencarian
    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    // Tambah Produk ke Keranjang
    const handleAddToCart = (product: any) => {
        if (product.track_stock && product.current_stock <= 0) {
            toast.error(`Stok produk "${product.name}" telah habis.`);
            return;
        }

        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            if (product.track_stock && existing.qty >= product.current_stock) {
                toast.error(`Stok maksimal "${product.name}" tercapai (${product.current_stock} item).`);
                return;
            }
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                id: product.id,
                name: product.name,
                sku: product.sku,
                price: product.sell_price,
                qty: 1,
                subtotal: product.sell_price,
                maxStock: product.current_stock,
                trackStock: product.track_stock
            }]);
        }

        toast.success(`"${product.name}" ditambahkan ke keranjang.`);
    };

    // Ubah Jumlah Item di Keranjang
    const updateQty = (id: string, delta: number) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;

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

    // Handler Input Jumlah Manual (Ketik Langsung)
    const handleQtyInputChange = (id: string, val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        if (cleanVal === '') {
            setCart(cart.map(i => i.id === id ? { ...i, qty: 0, subtotal: 0 } : i));
            return;
        }

        const parsed = parseInt(cleanVal);
        const item = cart.find(i => i.id === id);
        if (!item) return;

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

    // Hapus Item dari Keranjang
    const handleRemoveFromCart = (id: string, name: string) => {
        setCart(cart.filter(item => item.id !== id));
        toast.info(`"${name}" dihapus dari keranjang.`);
    };

    // Kalkulasi Total Belanja
    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    }, [cart]);

    // Ambil Promo Terpilih
    const activePromoObj = useMemo(() => {
        if (!selectedPromo) return null;
        return promos.find((p: any) => p.id === selectedPromo);
    }, [selectedPromo, promos]);

    // Hitung Diskon (Gabungan Promo Voucher dan Diskon Manual Nota)
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
        return promoDiscount + manualDiscount;
    }, [activePromoObj, cartSubtotal, manualDiscount]);

    // Hitung Pajak PPN Dinamis Berdasarkan Pengaturan Kasir
    const cartTax = useMemo(() => {
        if (!posSettings.taxEnabled) return 0;
        const rate = (posSettings.taxRate || 0) / 100;
        const netAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);
        return Math.round(netAfterDiscount * rate);
    }, [cartSubtotal, cartDiscount, posSettings]);

    // Total Akhir Sebelum Pembulatan
    const rawTotal = useMemo(() => {
        const netAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);
        return netAfterDiscount + cartTax;
    }, [cartSubtotal, cartDiscount, cartTax]);

    // Total Akhir Setelah Pembulatan Tunai (Khusus Tunai / Cash)
    const cartTotal = useMemo(() => {
        if (paymentMethod !== 'cash') return rawTotal;

        const nearest = parseInt(posSettings.roundingNearest) || 1;
        if (nearest <= 1) return rawTotal;

        const method = posSettings.roundingMethod || 'floor';
        if (method === 'floor') {
            return Math.floor(rawTotal / nearest) * nearest;
        } else if (method === 'ceil') {
            return Math.ceil(rawTotal / nearest) * nearest;
        } else {
            return Math.round(rawTotal / nearest) * nearest;
        }
    }, [rawTotal, paymentMethod, posSettings.roundingNearest, posSettings.roundingMethod]);

    // Selisih Pembulatan (Diberikan sebagai potongan / penyesuaian visual)
    const roundingDiff = useMemo(() => {
        return cartTotal - rawTotal;
    }, [cartTotal, rawTotal]);

    // Kembalian Pembayaran
    const changeAmount = useMemo(() => {
        if (paymentMethod === 'debt') return 0;
        return Math.max(0, paidAmount - cartTotal);
    }, [paidAmount, cartTotal, paymentMethod]);

    // Handler Jumlah Uang Bayar dengan Auto-Format Ribuan Rupiah
    const handlePaidAmountChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        const parsed = parseFloat(cleanVal);
        const numericValue = isNaN(parsed) ? 0 : parsed;
        setPaidAmount(numericValue);

        if (cleanVal === '') {
            setPaidAmountInput('');
        } else {
            setPaidAmountInput(numericValue.toLocaleString('id-ID'));
        }
    };

    // Handler Diskon Nota Manual dengan Auto-Format Ribuan Rupiah
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
            setManualDiscountInput(cartSubtotal.toLocaleString('id-ID'));
            setManualDiscount(cartSubtotal);
            return;
        }

        setManualDiscountInput(parsed.toLocaleString('id-ID'));
        setManualDiscount(parsed);
    };

    // Set Cepat Uang Bayar (Quick Cash)
    const setQuickCash = (amount: number) => {
        setPaidAmount(amount);
        setPaidAmountInput(amount.toLocaleString('id-ID'));
    };

    // Sinkronisasi Pengaturan POS Kasir Terminal ke Database
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

    // Proses Simpan Transaksi POS (Checkout)
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
            customer_id: selectedCustomer === 'umum' ? null : selectedCustomer,
            subtotal: cartSubtotal,
            discount: cartDiscount,
            tax: cartTax,
            rounding_diff: paymentMethod === 'cash' ? roundingDiff : 0,
            total: cartTotal,
            paid_amount: paymentMethod === 'debt' ? 0 : paidAmount,
            change_amount: paymentMethod === 'debt' ? 0 : changeAmount,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product_id: item.id,
                qty: item.qty,
                price: item.price,
                subtotal: item.subtotal
            }))
        };

        router.post('/pos/checkout', payload, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setIsSubmitting(false);

                // Siapkan data struk belanja
                const invoiceNum = page.props.flash?.success?.split('Nomor Invoice: ')[1] || `INV/${new Date().getTime()}`;
                const customerObj = customers.find((c: any) => c.id === selectedCustomer);

                setLastTransaction({
                    invoice_number: invoiceNum,
                    date: new Date(),
                    items: [...cart],
                    subtotal: cartSubtotal,
                    discount: cartDiscount,
                    tax: cartTax,
                    rounding_diff: paymentMethod === 'cash' ? roundingDiff : 0,
                    total: cartTotal,
                    paid_amount: paymentMethod === 'debt' ? 0 : paidAmount,
                    change_amount: paymentMethod === 'debt' ? 0 : changeAmount,
                    payment_method: paymentMethod,
                    customer: customerObj ? customerObj.name : 'Pelanggan Umum'
                });

                // Bersihkan Keranjang
                setCart([]);
                setPaidAmount(0);
                setPaidAmountInput('');
                setSelectedPromo(null);
                setSelectedCustomer('umum');
                setPaymentMethod('cash');

                // Tampilkan dialog struk cetak
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

    // Fungsi Cetak Struk ke Printer Kasir (Professional POS Thermal Print Pattern)
    const handlePrintReceipt = () => {
        const printContent = document.getElementById('receipt-print-area');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=350,height=600');
        if (!printWindow) {
            toast.error('Pop-up terblokir! Silakan aktifkan izin pop-up untuk mencetak struk.');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak Struk - ${lastTransaction?.invoice_number || 'POS'}</title>
                    <style>
                        @page {
                            margin: 0;
                        }
                        body {
                            font-family: 'Courier New', Courier, monospace;
                            width: 100%;
                            max-width: 280px;
                            margin: 0 auto;
                            padding: 10px;
                            box-sizing: border-box;
                            font-size: 11px;
                            line-height: 1.3;
                            color: #000;
                            background-color: #fff;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .border-t { border-top: 1px dashed #000; }
                        .py-1 { padding-top: 4px; padding-bottom: 4px; }
                        .py-2 { padding-top: 8px; padding-bottom: 8px; }
                        .flex-row { display: flex; justify-content: space-between; }
                        .gap-4 { gap: 16px; }
                        .font-black { font-weight: 900; }
                        .text-[10px] { font-size: 9px; color: #555; }
                        .text-[9px] { font-size: 8px; color: #777; }
                        .text-sm { font-size: 13px; }
                        .uppercase { text-transform: uppercase; }
                        .shrink-0 { flex-shrink: 0; }
                        .flex-1 { flex: 1; }
                        ::-webkit-scrollbar { display: none; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Fungsi Unduh Struk sebagai Gambar PNG Premium (Screen Capture Pattern)
    const handleDownloadReceiptImage = () => {
        const element = document.getElementById('receipt-print-area');
        if (!element) {
            toast.error('Gagal mendeteksi area struk untuk diambil gambar.');
            return;
        }

        const html2canvasFn = typeof html2canvas === 'function' ? html2canvas : (html2canvas as any).default;

        // Ambil data visual lama
        const originalMaxHeight = element.style.maxHeight;
        const originalOverflow = element.style.overflow;
        const originalClassName = element.className;

        // Ubah elemen secara dinamis menjadi struk putih bersih tanpa border/dasar abu-abu untuk diunduh
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.className = "p-6 bg-white font-mono text-xs text-slate-900 space-y-4 w-[280px]";

        toast.promise(
            html2canvasFn(element, {
                scale: 3, // Skala resolusi ultra tajam
                backgroundColor: '#ffffff', // Latar belakang putih bersih
                logging: false,
                useCORS: true
            }).then((canvas: any) => {
                // Kembalikan visual modal di layar kasir ke semula
                element.style.maxHeight = originalMaxHeight;
                element.style.overflow = originalOverflow;
                element.className = originalClassName;

                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                const invoiceName = lastTransaction?.invoice_number ? lastTransaction.invoice_number.replace(/\//g, '_') : 'struk';
                link.download = `STRUK_${invoiceName}.png`;
                link.href = imgData;
                link.click();
            }).catch((err: any) => {
                // Pastikan layout dikembalikan jika terjadi galat
                element.style.maxHeight = originalMaxHeight;
                element.style.overflow = originalOverflow;
                element.className = originalClassName;
                throw err;
            }),
            {
                loading: 'Mempersiapkan gambar struk resolusi tinggi...',
                success: 'Struk berhasil disimpan sebagai gambar PNG!',
                error: 'Gagal mengunduh struk sebagai gambar.'
            }
        );
    };

    // Fungsi Kirim Struk via WhatsApp secara modern
    const handleSendWhatsAppReceipt = () => {
        if (!lastTransaction) return;
        const phone = lastTransaction.phone || '';
        const name = lastTransaction.customer || 'Pelanggan';
        let text = `*TOKONA POS - STRUK BELANJA*\n`;
        text += `=========================\n`;
        text += `Inv: ${lastTransaction.invoice_number}\n`;
        text += `Tanggal: ${new Date(lastTransaction.date).toLocaleString('id-ID')}\n`;
        text += `Pelanggan: ${name}\n`;
        text += `=========================\n`;
        lastTransaction.items.forEach((it: any) => {
            text += `*${it.name}*\n  ${it.qty} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}\n`;
        });
        text += `=========================\n`;
        text += `Subtotal: ${formatRupiah(lastTransaction.subtotal)}\n`;
        if (lastTransaction.discount > 0) {
            text += `Diskon: -${formatRupiah(lastTransaction.discount)}\n`;
        }
        text += `PPN: ${formatRupiah(lastTransaction.tax)}\n`;
        if (lastTransaction.rounding_diff && lastTransaction.rounding_diff !== 0) {
            text += `Pembulatan Tunai: ${lastTransaction.rounding_diff > 0 ? '+' : ''}${formatRupiah(lastTransaction.rounding_diff)}\n`;
        }
        text += `*TOTAL: ${formatRupiah(lastTransaction.total)}*\n`;
        text += `=========================\n`;
        text += `Terima kasih atas kunjungan Anda!\n`;

        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
    };

    // Cetak Ulang Struk dari Riwayat
    const handleReprint = (tx: any) => {
        setLastTransaction({
            invoice_number: tx.invoice_number,
            date: tx.created_at,
            items: tx.items.map((i: any) => ({
                name: i.product?.name ?? 'Barang Dihapus',
                qty: i.qty,
                price: parseFloat(i.price),
                subtotal: parseFloat(i.subtotal)
            })),
            subtotal: parseFloat(tx.subtotal),
            discount: parseFloat(tx.discount),
            tax: parseFloat(tx.tax),
            rounding_diff: parseFloat(tx.rounding_diff || 0),
            total: parseFloat(tx.total),
            paid_amount: parseFloat(tx.paid_amount),
            change_amount: parseFloat(tx.change_amount),
            payment_method: tx.payment_method,
            customer: tx.customer?.name ?? 'Pelanggan Umum'
        });
        setShowSuccessModal(true);
    };

    // ─── Fitur Draft / Pending Order ─────────────────────────────────────────

    // Simpan Keranjang Menjadi Draft
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

        // Reset Keranjang Aktif
        setCart([]);
        setDraftNotes('');
        setShowDraftModal(false);
        toast.success('Transaksi berhasil ditahan sebagai draft/pending order.');
    };

    // Memuat kembali Draft ke Keranjang
    const handleLoadDraft = (draft: any) => {
        setCart(draft.items);
        setSelectedCustomer(draft.customer_id);
        setSelectedPromo(draft.promo_id);
        setPaymentMethod(draft.payment_method);

        // Hapus draft yang telah dimuat
        const updated = drafts.filter(d => d.id !== draft.id);
        setDrafts(updated);
        localStorage.setItem('tokona_pos_drafts', JSON.stringify(updated));

        setActiveTab('cashier');
        toast.success(`Draft "${draft.notes}" berhasil dimuat kembali ke kasir.`);
    };

    // Hapus Draft
    const handleDeleteDraft = (id: string) => {
        const updated = drafts.filter(d => d.id !== id);
        setDrafts(updated);
        localStorage.setItem('tokona_pos_drafts', JSON.stringify(updated));
        toast.info('Draft transaksi berhasil dihapus.');
    };

    // ─── Fitur Retur Penjualan ────────────────────────────────────────────────

    // Ketika Transaksi yang Akan Diretur Dipilih
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
                qty: i.qty // default retur semua
            })));
        }
    };

    // Ubah Jumlah Barang yang Diretur
    const handleReturnQtyChange = (productId: string, val: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(0, Math.min(item.qty_bought, val));
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    // Handler Ketik Manual untuk Jumlah Barang Diretur
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

    // Proses Eksekusi Simpan Retur Penjualan
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
                toast.success('Retur penjualan berhasil diproses! Inventori & keuangan otomatis ter-update.');
                setActiveTab('transactions');
            },
            onError: (err) => {
                setIsSubmittingReturn(false);
                const firstErr = Object.values(err)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal memproses retur.');
            }
        });
    };

    return (
        <MainLayout>
            <Head title="Point of Sale (POS) - Tokona ERP" />

            {/* TAB HEADER NAVIGASI MODERN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm mb-6 shrink-0">
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
                        onClick={() => setActiveTab('cashier')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'cashier'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Kasir
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'transactions'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <History className="h-3.5 w-3.5" />
                        Daftar Transaksi
                    </button>
                    <button
                        onClick={() => setActiveTab('returns')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'returns'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retur Penjualan
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'drafts'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Bookmark className="h-3.5 w-3.5" />
                        Draft / Pending
                        {drafts.length > 0 && (
                            <Badge className="bg-amber-500 text-white border-0 text-[10px] font-black h-4 px-1 shrink-0">
                                {drafts.length}
                            </Badge>
                        )}
                    </button>
                </div>
            </div>

            {/* KONTEN BERDASARKAN TAB AKTIF */}
            <div className="h-[calc(100vh-210px)] overflow-hidden">

                {/* ─── TAB 1: KASIR UTAMA ───────────────────────────────────── */}
                {activeTab === 'cashier' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full overflow-hidden">
                        {/* BAGIAN KIRI: KATALOG PRODUK */}
                        <div className="xl:col-span-7 flex flex-col gap-4 h-full min-w-0">
                            {/* Pencarian */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-3 rounded-xl border shadow-sm shrink-0">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari nama barang, kode SKU, atau scan barcode..."
                                        className="pl-9 h-10 border-slate-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-600">
                                        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                                        Cabang Kasir Utama
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-black border-slate-200 hover:bg-slate-50 bg-white shadow-sm">
                                                <Settings className="h-3.5 w-3.5 text-slate-500" />
                                                Pengaturan Kasir
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="text-sm font-black text-slate-800">Pengaturan Terminal POS</DialogTitle>
                                                <DialogDescription className="text-xs">
                                                    Ubah pengaturan pajak PPN dinamis dan metode pembayaran aktif pada peramban/terminal kasir ini.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-3">
                                                {/* Pajak PPN */}
                                                <div className="space-y-2 border-b pb-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-black text-slate-700">Aktifkan Pajak (PPN)</Label>
                                                        <input
                                                            type="checkbox"
                                                            checked={posSettings.taxEnabled}
                                                            onChange={(e) => {
                                                                const updated = { ...posSettings, taxEnabled: e.target.checked };
                                                                setPosSettings(updated);
                                                                localStorage.setItem('tokona_pos_settings', JSON.stringify(updated));
                                                            }}
                                                            className="h-4 w-4 rounded border-slate-350 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                                        />
                                                    </div>
                                                    {posSettings.taxEnabled && (
                                                        <div className="flex items-center justify-between gap-3 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            <Label className="text-xs font-bold text-slate-655">Tarif Pajak PPN (%)</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="h-8 w-20 text-xs font-mono font-bold text-center border-slate-200 focus-visible:ring-slate-900 bg-white"
                                                                value={posSettings.taxRate}
                                                                onChange={(e) => {
                                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                                    const updated = { ...posSettings, taxRate: val };
                                                                    setPosSettings(updated);
                                                                    localStorage.setItem('tokona_pos_settings', JSON.stringify(updated));
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Metode Pembayaran */}
                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black text-slate-750">Metode Pembayaran Aktif</Label>
                                                    <div className="space-y-2">
                                                        {[
                                                            { key: 'cash', label: 'Tunai (Cash)' },
                                                            { key: 'transfer', label: 'Transfer / QRIS' },
                                                            { key: 'debt', label: 'Piutang (Hutang)' }
                                                        ].map((m) => (
                                                            <div key={m.key} className="flex items-center justify-between text-xs font-semibold text-slate-650">
                                                                <span>{m.label}</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={posSettings.activeMethods[m.key]}
                                                                    onChange={(e) => {
                                                                        const updatedMethods = { ...posSettings.activeMethods, [m.key]: e.target.checked };
                                                                        // Minimal harus ada 1 metode pembayaran yang aktif
                                                                        if (Object.values(updatedMethods).filter(Boolean).length === 0) {
                                                                            toast.error('Minimal harus ada 1 metode pembayaran aktif!');
                                                                            return;
                                                                        }
                                                                        const updated = { ...posSettings, activeMethods: updatedMethods };
                                                                        setPosSettings(updated);
                                                                        localStorage.setItem('tokona_pos_settings', JSON.stringify(updated));
                                                                    }}
                                                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pembulatan Tunai */}
                                                <div className="space-y-3 border-t pt-3">
                                                    <Label className="text-xs font-black text-slate-750">Pembulatan Tunai (Cash Rounding)</Label>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-slate-500">Kelipatan</span>
                                                            <Select
                                                                value={(posSettings.roundingNearest || 100).toString()}
                                                                onValueChange={(val) => {
                                                                    const updated = { ...posSettings, roundingNearest: parseInt(val) };
                                                                    setPosSettings(updated);
                                                                    localStorage.setItem('tokona_pos_settings', JSON.stringify(updated));
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs font-bold border-slate-200 focus:ring-slate-900 bg-white">
                                                                    <SelectValue placeholder="Pilih kelipatan" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="1">Tidak Ada</SelectItem>
                                                                    <SelectItem value="100">Rp 100</SelectItem>
                                                                    <SelectItem value="500">Rp 500</SelectItem>
                                                                    <SelectItem value="1000">Rp 1.000</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-slate-500">Metode</span>
                                                            <Select
                                                                value={posSettings.roundingMethod || 'floor'}
                                                                onValueChange={(val) => {
                                                                    const updated = { ...posSettings, roundingMethod: val };
                                                                    setPosSettings(updated);
                                                                    localStorage.setItem('tokona_pos_settings', JSON.stringify(updated));
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs font-bold border-slate-200 focus:ring-slate-900 bg-white">
                                                                    <SelectValue placeholder="Pilih metode" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="round">Terdekat (Round)</SelectItem>
                                                                    <SelectItem value="floor">Ke Bawah (Floor)</SelectItem>
                                                                    <SelectItem value="ceil">Ke Atas (Ceil)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t mt-4">
                                                    <Button
                                                        type="button"
                                                        onClick={handleSaveSettingsToDb}
                                                        disabled={isSavingDb}
                                                        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs h-9 rounded-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                                                    >
                                                        {isSavingDb ? 'Menyinkronkan...' : 'SIMPAN KE DATABASE'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Saringan Tab Kategori */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 shrink-0">
                                {categories.map((cat: string) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedCategory === cat
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm shadow-slate-100'
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Grid Katalog Produk */}
                            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 auto-rows-max gap-3 min-h-0">
                                {filteredProducts.length === 0 ? (
                                    <div className="col-span-full flex flex-col justify-center items-center py-20 text-slate-400 bg-white rounded-2xl border">
                                        <AlertCircle className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
                                        <span className="text-sm font-medium">Barang tidak ditemukan.</span>
                                    </div>
                                ) : (
                                    filteredProducts.map((p: any) => {
                                        const isLowStock = p.track_stock && p.current_stock <= 5 && p.current_stock > 0;
                                        const isOutOfStock = p.track_stock && p.current_stock <= 0;

                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => !isOutOfStock && handleAddToCart(p)}
                                                className={`group relative flex flex-col bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-indigo-400 h-fit ${isOutOfStock
                                                    ? 'opacity-60 cursor-not-allowed bg-slate-50'
                                                    : ''
                                                    }`}
                                            >
                                                {/* Foto / Visual Ringan - RAPI & AUTO-RESIZE COMPACT */}
                                                <div className="h-24 bg-slate-50 flex items-center justify-center border-b relative p-2 overflow-hidden shrink-0">
                                                    {p.image ? (
                                                        <img
                                                            src={p.image}
                                                            alt={p.name}
                                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <ShoppingCart className="h-8 w-8 text-slate-300/70 group-hover:rotate-12 transition-transform" />
                                                    )}

                                                    {/* Tag Stok */}
                                                    {p.track_stock && (
                                                        <Badge
                                                            className={`absolute top-1.5 right-1.5 border-0 text-[9px] font-extrabold px-1.5 py-0.5 ${isOutOfStock ? 'bg-red-500 hover:bg-red-500 text-white' :
                                                                isLowStock ? 'bg-amber-500 hover:bg-amber-500 text-white' :
                                                                    'bg-emerald-500 hover:bg-emerald-500 text-white'
                                                                }`}
                                                        >
                                                            {isOutOfStock ? 'Habis' : `Stok: ${p.current_stock}`}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Info Produk COMPACT */}
                                                <div className="p-2.5 flex flex-col gap-1">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                                            {p.sku}
                                                        </span>
                                                        <h3 className="text-xs font-black text-slate-800 line-clamp-1 mt-0.5 group-hover:text-indigo-650 transition-colors">
                                                            {p.name}
                                                        </h3>

                                                        {/* Deskripsi Singkat Barang */}
                                                        {p.description && (
                                                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium" title={p.description}>
                                                                {p.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 shrink-0">
                                                        <span className="text-xs font-black text-indigo-600 font-semibold">
                                                            {formatRupiah(p.sell_price)}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 capitalize px-1.5 py-0.5 bg-slate-100 rounded">
                                                            {p.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* BAGIAN KANAN: KERANJANG & CHECKOUT */}
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
                                        {cart.reduce((sum, item) => sum + item.qty, 0)} Barang
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

                            {/* Ringkasan & Panel Checkout Collapsible Accordion */}
                            <div className="border-t bg-slate-50 shrink-0 flex flex-col p-4 space-y-3">
                                {/* Clickable Accordion Header Bar */}
                                <div
                                    onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                                    className="flex justify-between items-center px-4 py-3 bg-slate-900 text-white cursor-pointer hover:bg-slate-950 transition-all select-none shrink-0 rounded-xl shadow-lg"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">TOTAL TAGIHAN</span>
                                        <span className="font-mono text-sm font-black text-white">{formatRupiah(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-200 bg-white/10 px-2 py-1 rounded-md">
                                        <span>{isPaymentExpanded ? 'Sembunyikan Detail' : 'Atur Pembayaran'}</span>
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isPaymentExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Accordion Content Body */}
                                {isPaymentExpanded && (
                                    <div className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white shadow-sm max-h-[220px] overflow-y-auto">
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
                                            {['cash', 'transfer', 'debt'].map((method) => {
                                                if (posSettings.activeMethods && !posSettings.activeMethods[method]) return null;
                                                const isSelected = paymentMethod === method;
                                                const labels: any = {
                                                    cash: 'Tunai',
                                                    transfer: 'Transfer/QRIS',
                                                    debt: 'Hutang'
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

                                        {paymentMethod !== 'debt' && (
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
                                                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-[10px] font-black rounded-md text-slate-600 shrink-0 font-mono"
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

                                {/* Fast Checkout CTA footer - ALWAYS VISIBLE, wide and spacious */}
                                <Button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || isSubmitting}
                                    className="w-full h-14 bg-slate-900 hover:bg-slate-950 text-white font-black text-base gap-2 rounded-xl shadow-lg transition-all active:scale-[0.98] shrink-0"
                                >
                                    {isSubmitting ? 'Memproses Checkout...' : 'PROSES TRANSAKSI'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 2: DAFTAR TRANSAKSI (RIWAYAT KASIR) ────────────────── */}
                {activeTab === 'transactions' && (
                    <Card className="h-full flex flex-col bg-white border shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-center pb-2 shrink-0">
                            <div>
                                <CardTitle className="text-sm font-black text-slate-800">Riwayat Transaksi Penjualan</CardTitle>
                                <CardDescription className="text-xs">Menampilkan daftar transaksi penjualan cabang kasir Anda</CardDescription>
                            </div>
                            <Badge className="bg-slate-100 border-slate-200 text-slate-700 h-6 font-bold" variant="outline">
                                Ditemukan: {filteredTransactions.length} dari {transactions.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-3 pt-0">
                            {/* Bar Filter Transaksi Komprehensif (Premium Filtering Bar Pattern) */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                                {/* 1. Cari Invoice / Pelanggan */}
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Cari Faktur / Pelanggan</span>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="No. Faktur atau nama..."
                                            value={txSearchQuery}
                                            onChange={(e) => setTxSearchQuery(e.target.value)}
                                            className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* 2. Filter Metode Pembayaran */}
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Metode Pembayaran</span>
                                    <Select value={txPaymentMethod} onValueChange={setTxPaymentMethod}>
                                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 focus:ring-slate-900 w-full">
                                            <SelectValue placeholder="Semua Metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Metode</SelectItem>
                                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                                            <SelectItem value="transfer">Transfer / QRIS</SelectItem>
                                            <SelectItem value="debt">Piutang (Debt)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 3. Filter Status */}
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status Transaksi</span>
                                    <Select value={txStatus} onValueChange={setTxStatus}>
                                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 focus:ring-slate-900 w-full">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="paid">Lunas</SelectItem>
                                            <SelectItem value="returned">Diretur</SelectItem>
                                            <SelectItem value="draft">Kredit / Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 4. Filter Tanggal / Periode */}
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Periode Waktu</span>
                                    <Select value={txDateRange} onValueChange={setTxDateRange}>
                                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 focus:ring-slate-900 w-full">
                                            <SelectValue placeholder="Semua Waktu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Waktu</SelectItem>
                                            <SelectItem value="today">Hari Ini</SelectItem>
                                            <SelectItem value="yesterday">Kemarin</SelectItem>
                                            <SelectItem value="this_week">7 Hari Terakhir</SelectItem>
                                            <SelectItem value="this_month">Bulan Ini</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader className="bg-slate-50 font-black">
                                    <TableRow>
                                        <TableHead className="w-[180px]">Tanggal & Waktu</TableHead>
                                        <TableHead>No. Faktur</TableHead>
                                        <TableHead>Pelanggan</TableHead>
                                        <TableHead>Metode Bayar</TableHead>
                                        <TableHead className="text-right">Total Transaksi</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-xs font-semibold">
                                                Tidak ada transaksi yang cocok dengan filter pencarian.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTransactions.map((tx: any) => (
                                            <TableRow key={tx.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-mono text-xs text-slate-600">
                                                    {new Date(tx.created_at).toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="font-black text-slate-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDetailTransaction(tx);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="hover:underline text-indigo-650 hover:text-indigo-850 font-black text-left cursor-pointer transition-all active:scale-[0.97]"
                                                        title="Klik untuk melihat detail lengkap transaksi"
                                                    >
                                                        {tx.invoice_number}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold text-slate-700">
                                                    {tx.customer?.name ?? 'Pelanggan Umum'}
                                                </TableCell>
                                                <TableCell className="capitalize text-xs font-bold text-slate-600">
                                                    {tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method === 'transfer' ? 'Transfer' : 'Hutang'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-black text-slate-900">
                                                    {formatRupiah(parseFloat(tx.total))}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        className={`border-0 font-extrabold text-[10px] ${tx.status === 'paid' ? 'bg-emerald-500 text-white' :
                                                            tx.status === 'returned' ? 'bg-red-500 text-white' :
                                                                'bg-amber-500 text-white'
                                                            }`}
                                                    >
                                                        {tx.status === 'paid' ? 'Lunas' : tx.status === 'returned' ? 'Diretur' : 'Kredit'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        onClick={() => handleReprint(tx)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[10px] h-8 font-black gap-1 border-slate-300 text-slate-750 hover:bg-slate-100 bg-white"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" /> Struk
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* ─── TAB 3: RETUR PENJUALAN (SALES RETURN) ────────────────── */}
                {activeTab === 'returns' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
                        {/* Kiri: Pilih Transaksi & Barang */}
                        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border shadow-sm p-4 h-full overflow-hidden">
                            <div className="mb-4 shrink-0">
                                <Label className="text-xs font-black text-slate-700">Pilih Transaksi yang Akan Diretur</Label>
                                <Select value={selectedReturnTxId} onValueChange={handleReturnTxChange}>
                                    <SelectTrigger className="w-full mt-1.5 h-10 text-xs border-slate-200">
                                        <SelectValue placeholder="Pilih Faktur Penjualan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="select">Pilih Faktur Penjualan...</SelectItem>
                                        {transactions.filter((t: any) => t.status !== 'returned').map((tx: any) => (
                                            <SelectItem key={tx.id} value={tx.id}>
                                                {tx.invoice_number} - {tx.customer?.name ?? 'Umum'} ({formatRupiah(parseFloat(tx.total))})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Daftar Barang didalam Transaksi */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                {selectedReturnTxId === 'select' ? (
                                    <div className="h-full flex flex-col justify-center items-center text-slate-400 py-10">
                                        <Undo2 className="h-12 w-12 text-slate-300 mb-2" />
                                        <span className="text-xs font-semibold">Silakan pilih faktur penjualan terlebih dahulu.</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50 font-black">
                                            <TableRow>
                                                <TableHead>Nama Barang</TableHead>
                                                <TableHead className="text-right">Harga Jual</TableHead>
                                                <TableHead className="text-center">Jumlah Beli</TableHead>
                                                <TableHead className="text-center w-[150px]">Jumlah Retur</TableHead>
                                                <TableHead className="text-right">Subtotal Retur</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {returnItems.map((item) => (
                                                <TableRow key={item.product_id}>
                                                    <TableCell>
                                                        <p className="font-bold text-slate-800">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono uppercase">{item.sku}</p>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-bold text-slate-700">
                                                        {formatRupiah(item.price)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-700">
                                                        {item.qty_bought}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center border rounded-lg bg-slate-50 p-0.5">
                                                            <Button
                                                                onClick={() => handleReturnQtyChange(item.product_id, item.qty - 1)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-md hover:bg-white text-slate-500"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <input
                                                                type="text"
                                                                value={item.qty === 0 ? '' : item.qty}
                                                                onChange={(e) => handleReturnQtyInputChange(item.product_id, e.target.value)}
                                                                className="text-xs font-black w-8 text-center text-slate-700 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none font-mono"
                                                            />
                                                            <Button
                                                                onClick={() => handleReturnQtyChange(item.product_id, item.qty + 1)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-md hover:bg-white text-slate-500"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-black text-red-655">
                                                        {formatRupiah(item.price * item.qty)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>

                        {/* Kanan: Ringkasan Pengembalian Dana */}
                        <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border shadow-sm p-4 h-full shrink-0 justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b text-slate-800">
                                    <RefreshCw className="h-5 w-5" />
                                    <h3 className="text-sm font-black text-slate-800">Ringkasan Retur</h3>
                                </div>

                                <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Total Item Diretur</span>
                                        <span className="font-bold text-slate-800">
                                            {returnItems.reduce((sum, i) => sum + i.qty, 0)} Pcs
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-slate-800 pt-3 border-t border-dashed">
                                        <span className="text-red-600 font-bold">Dana Pengembalian</span>
                                        <span className="font-mono text-red-600 text-lg">
                                            {formatRupiah(returnItems.reduce((sum, i) => sum + (i.price * i.qty), 0))}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-800 flex gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                                    <p className="font-medium leading-relaxed">
                                        Proses retur ini bersifat <strong>irreversible</strong> (tidak dapat dibatalkan). Stok barang akan otomatis dikembalikan ke inventori cabang kasir ini.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleProcessReturn}
                                disabled={selectedReturnTxId === 'select' || isSubmittingReturn || returnItems.reduce((sum, i) => sum + i.qty, 0) === 0}
                                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl gap-2 mt-4"
                            >
                                <RefreshCw className={`h-4 w-4 ${isSubmittingReturn ? 'animate-spin' : ''}`} />
                                {isSubmittingReturn ? 'Memproses Retur...' : 'PROSES RETUR PENJUALAN'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ─── TAB 4: DRAFT / PENDING ORDERS ────────────────────────── */}
                {activeTab === 'drafts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto pr-1">
                        {drafts.length === 0 ? (
                            <div className="col-span-full h-80 flex flex-col justify-center items-center text-slate-400 bg-white rounded-2xl border shadow-sm">
                                <FolderOpen className="h-12 w-12 text-slate-300 mb-2 animate-pulse" />
                                <span className="text-xs font-semibold">Tidak ada draft transaksi yang ditahan saat ini.</span>
                            </div>
                        ) : (
                            drafts.map((dr: any) => {
                                const totalAmount = dr.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
                                const totalQty = dr.items.reduce((sum: number, i: any) => sum + i.qty, 0);

                                return (
                                    <Card key={dr.id} className="bg-white border shadow-sm hover:shadow transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-black h-5 uppercase">
                                                    Draft Order
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(dr.date).toLocaleTimeString('id-ID')}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm font-black text-slate-800 mt-2 truncate">
                                                {dr.notes}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-medium font-mono text-slate-400">
                                                {new Date(dr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="divide-y divide-slate-100 max-h-[120px] overflow-y-auto pr-1">
                                                {dr.items.map((it: any) => (
                                                    <div key={it.id} className="py-1.5 flex justify-between text-xs font-semibold text-slate-600">
                                                        <span className="truncate flex-1 max-w-[180px]">{it.name}</span>
                                                        <span className="shrink-0 text-slate-400">x{it.qty}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-dashed">
                                                <div className="text-xs font-semibold text-slate-450">
                                                    <p>Total {totalQty} Item</p>
                                                    <p className="font-mono font-black text-slate-800 mt-0.5 text-sm">
                                                        {formatRupiah(totalAmount)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleDeleteDraft(dr.id)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleLoadDraft(dr)}
                                                        className="bg-slate-900 hover:bg-slate-950 text-white font-black text-xs h-8 px-3 rounded-lg flex gap-1 items-center"
                                                    >
                                                        <FolderOpen className="h-3.5 w-3.5" />
                                                        Buka
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* ─── DIALOG RESI / STRUK (Thermal Layout 58-80mm) ──────────────── */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md p-6 overflow-hidden">
                    <DialogHeader className="flex flex-col items-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce mb-2" />
                        <DialogTitle className="text-lg font-black text-slate-800">Transaksi Sukses!</DialogTitle>
                        <DialogDescription className="text-xs text-center">
                            Faktur penjualan telah tersimpan dan terintegrasi secara otomatis di modul Akuntansi.
                        </DialogDescription>
                    </DialogHeader>

                    {/* DETAIL STRUK (Siap Cetak / Thermal 58-80mm Layout) */}
                    <div id="receipt-print-area" className="my-4 p-4 border border-dashed rounded-lg bg-slate-50 font-mono text-xs text-slate-800 space-y-4 max-h-[300px] overflow-y-auto">
                        <div className="text-center space-y-1">
                            <h2 className="text-sm font-black tracking-widest uppercase">TOKONA ERP & CRM</h2>
                            <p className="text-[10px] text-slate-500">Cabang Kasir Utama Tokona</p>
                            <p className="text-[10px] text-slate-500">Tanggal: {lastTransaction?.date ? new Date(lastTransaction.date).toLocaleString('id-ID') : '-'}</p>
                            <p className="text-[10px] text-slate-500">Inv: {lastTransaction?.invoice_number}</p>
                            <p className="text-[10px] text-slate-500">Pelanggan: {lastTransaction?.customer}</p>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-2 space-y-2">
                            {lastTransaction?.items.map((it: any, idx: number) => (
                                <div key={idx} className="flex justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold">{it.name}</p>
                                        <p className="text-[10px] text-slate-500">{it.qty} x {formatRupiah(it.price)}</p>
                                    </div>
                                    <span className="font-bold shrink-0">{formatRupiah(it.subtotal)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatRupiah(lastTransaction?.subtotal || 0)}</span>
                            </div>
                            {lastTransaction?.discount > 0 && (
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Diskon</span>
                                    <span>- {formatRupiah(lastTransaction?.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>PPN ({lastTransaction?.subtotal && lastTransaction?.tax > 0 ? `${Math.round((lastTransaction.tax / Math.max(1, (lastTransaction.subtotal - (lastTransaction.discount || 0)))) * 100)}%` : '0%'})</span>
                                <span>{formatRupiah(lastTransaction?.tax || 0)}</span>
                            </div>
                            {lastTransaction?.rounding_diff !== 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Pembulatan Tunai</span>
                                    <span>{lastTransaction?.rounding_diff > 0 ? '+' : ''}{formatRupiah(lastTransaction?.rounding_diff || 0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-slate-300">
                                <span>TOTAL BELANJA</span>
                                <span>{formatRupiah(lastTransaction?.total || 0)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                            <div className="flex justify-between">
                                <span>Metode Bayar</span>
                                <span className="uppercase font-bold">{lastTransaction?.payment_method === 'cash' ? 'Tunai' : lastTransaction?.payment_method === 'transfer' ? 'Transfer' : 'Hutang'}</span>
                            </div>
                            {lastTransaction?.payment_method !== 'debt' && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Dibayar</span>
                                        <span>{formatRupiah(lastTransaction?.paid_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kembalian</span>
                                        <span>{formatRupiah(lastTransaction?.change_amount || 0)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400">
                            *** TERIMA KASIH ATAS KUNJUNGAN ANDA ***
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button
                            onClick={handlePrintReceipt}
                            variant="outline"
                            className="flex-1 font-bold gap-1.5 h-10 border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
                        >
                            <Printer className="h-4 w-4 text-slate-500" /> Cetak Struk
                        </Button>
                        <Button
                            onClick={handleDownloadReceiptImage}
                            variant="outline"
                            className="flex-1 font-bold gap-1.5 h-10 border-indigo-300 text-indigo-700 hover:bg-indigo-50 bg-indigo-50/20"
                        >
                            <Download className="h-4 w-4 text-indigo-600" /> Unduh Gambar
                        </Button>
                        <Button
                            onClick={handleSendWhatsAppReceipt}
                            variant="outline"
                            className="flex-1 font-bold gap-1.5 h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/20"
                        >
                            <Share2 className="h-4 w-4 text-emerald-600" /> Kirim WhatsApp
                        </Button>
                        <Button
                            onClick={() => setShowSuccessModal(false)}
                            className="flex-1 font-black h-10 bg-slate-900 hover:bg-slate-950 text-white"
                        >
                            Selesai
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG TAHAN TRANSAKSI (SIMPAN DRAFT) */}
            <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black text-slate-800">Tahan Transaksi (Simpan Draft)</DialogTitle>
                        <DialogDescription className="text-xs">
                            Simpan keranjang saat ini sebagai antrean sementara untuk melayani pelanggan berikutnya terlebih dahulu.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-3">
                        <Label className="text-xs font-bold text-slate-550">Catatan Draft / Nama Antrean</Label>
                        <Input
                            placeholder="Contoh: Meja 5, Antrean Ibu Budi, Pending Mie..."
                            className="h-10 text-xs border-slate-200"
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => setShowDraftModal(false)}
                            variant="outline"
                            className="text-xs font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveDraft}
                            className="bg-slate-900 hover:bg-slate-950 text-white font-black text-xs"
                        >
                            Tahan Transaksi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── DIALOG DETAIL TRANSAKSI LENGKAP (ERP & Audit View) ────────── */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-white">
                    <DialogHeader className="shrink-0 pb-2 border-b border-slate-100 flex flex-row justify-between items-center">
                        <div>
                            <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-indigo-650" /> Detail Faktur: {selectedDetailTransaction?.invoice_number}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Informasi lengkap transaksi penjualan kasir cabang
                            </DialogDescription>
                        </div>
                        {selectedDetailTransaction && (
                            <Badge
                                className={`border-0 font-extrabold text-[10px] px-2.5 py-1 ${selectedDetailTransaction.status === 'paid' ? 'bg-emerald-500 text-white' :
                                    selectedDetailTransaction.status === 'returned' ? 'bg-red-500 text-white' :
                                        'bg-amber-500 text-white'
                                    }`}
                            >
                                {selectedDetailTransaction.status === 'paid' ? 'Lunas / Terbayar' : selectedDetailTransaction.status === 'returned' ? 'Diretur' : 'Kredit'}
                            </Badge>
                        )}
                    </DialogHeader>

                    {selectedDetailTransaction && (
                        <div className="flex-1 overflow-y-auto space-y-5 py-4 min-h-0 pr-1 text-slate-800">
                            {/* Grid Metadata Transaksi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">WAKTU & KASIR</span>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800">Tanggal: {new Date(selectedDetailTransaction.created_at).toLocaleString('id-ID')}</p>
                                        <p className="text-slate-650 font-semibold">Kasir: {selectedDetailTransaction.creator?.name || 'Kasir Default'}</p>
                                        <p className="text-slate-500 text-[10px]">ID Kasir: {selectedDetailTransaction.creator?.id?.slice(0, 8) || '-'}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PELANGGAN</span>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800">{selectedDetailTransaction.customer?.name || 'Pelanggan Umum (Walk-in)'}</p>
                                        {selectedDetailTransaction.customer?.phone && (
                                            <p className="text-slate-650">No. HP: {selectedDetailTransaction.customer.phone}</p>
                                        )}
                                        {selectedDetailTransaction.customer?.email && (
                                            <p className="text-slate-500 text-[10px]">Email: {selectedDetailTransaction.customer.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PEMBAYARAN & OUTLET</span>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-850">Metode: <span className="uppercase text-indigo-650 font-black">{selectedDetailTransaction.payment_method === 'cash' ? 'Tunai (Cash)' : selectedDetailTransaction.payment_method === 'transfer' ? 'Transfer' : 'Piutang'}</span></p>
                                        <p className="text-slate-650 font-semibold">Outlet: {branches?.find((b: any) => b.id === selectedDetailTransaction.branch_id)?.name || 'Cabang POS'}</p>
                                        <p className="text-slate-500 text-[10px]">Kode Cabang: {branches?.find((b: any) => b.id === selectedDetailTransaction.branch_id)?.code || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Barang Belanja */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rincian Keranjang Barang</span>
                                <div className="border rounded-lg overflow-hidden border-slate-200 bg-white">
                                    <Table>
                                        <TableHeader className="bg-slate-50 font-black">
                                            <TableRow>
                                                <TableHead className="h-9 font-black">Barang / Item</TableHead>
                                                {isSuperAdmin && <TableHead className="text-right h-9 font-black text-slate-700">Harga Modal</TableHead>}
                                                <TableHead className="text-right h-9 font-black">Harga Jual</TableHead>
                                                <TableHead className="text-center h-9 font-black">Qty</TableHead>
                                                <TableHead className="text-right h-9 font-black">Subtotal</TableHead>
                                                {isSuperAdmin && <TableHead className="text-right h-9 font-black text-emerald-850">Margin</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {selectedDetailTransaction.items?.map((it: any, idx: number) => {
                                                const cost = parseFloat(it.product?.base_cost || 0);
                                                const price = parseFloat(it.price || 0);
                                                const qty = parseInt(it.qty || 0);
                                                const itemSubtotal = parseFloat(it.subtotal || 0);
                                                const profit = (price - cost) * qty;

                                                return (
                                                    <TableRow key={idx} className="hover:bg-slate-50/30">
                                                        <TableCell className="py-2.5">
                                                            <div className="font-bold text-slate-850">{it.product?.name || 'Produk Terhapus'}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono">
                                                                {it.product?.sku ? `SKU: ${it.product.sku}` : ''}
                                                                {it.product?.barcode ? ` | Barcode: ${it.product.barcode}` : ''}
                                                            </div>
                                                        </TableCell>
                                                        {isSuperAdmin && (
                                                            <TableCell className="text-right font-mono text-slate-550 py-2.5">
                                                                {formatRupiah(cost)}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-right font-mono font-bold text-slate-800 py-2.5">
                                                            {formatRupiah(price)}
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-slate-700 py-2.5">
                                                            {qty}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono font-black text-slate-900 py-2.5">
                                                            {formatRupiah(itemSubtotal)}
                                                        </TableCell>
                                                        {isSuperAdmin && (
                                                            <TableCell className={`text-right font-mono font-black py-2.5 ${profit >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
                                                                {formatRupiah(profit)}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Rincian Keuangan & Total */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                {/* Profit Margin Box (Khusus Super Admin) */}
                                <div className="space-y-3">
                                    {isSuperAdmin && (
                                        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
                                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">AUDIT PROFIT MARGIN (SUPER ADMIN VIEW)</span>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-650 font-bold">Total Keuntungan Bersih:</span>
                                                <span className="font-mono font-black text-base text-emerald-700">
                                                    {formatRupiah(
                                                        selectedDetailTransaction.items?.reduce((acc: number, it: any) => {
                                                            const cost = parseFloat(it.product?.base_cost || 0);
                                                            const price = parseFloat(it.price || 0);
                                                            const qty = parseInt(it.qty || 0);
                                                            return acc + ((price - cost) * qty);
                                                        }, 0) || 0
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-emerald-650 leading-relaxed font-medium">
                                                * Keuntungan dihitung dari selisih harga jual faktur dikurangi harga modal supplier (base cost) produk dikalikan kuantitas.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Block */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 space-y-2 text-xs shadow-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-650">Subtotal Belanja</span>
                                        <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.subtotal || 0))}</span>
                                    </div>
                                    {parseFloat(selectedDetailTransaction.discount || 0) > 0 && (
                                        <div className="flex justify-between text-red-650 font-bold">
                                            <span>Diskon Promo / Voucher</span>
                                            <span className="font-mono">- {formatRupiah(parseFloat(selectedDetailTransaction.discount || 0))}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-650">Pajak (PPN)</span>
                                        <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.tax || 0))}</span>
                                    </div>
                                    {parseFloat(selectedDetailTransaction.rounding_diff || 0) !== 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>Selisih Pembulatan Tunai</span>
                                            <span className="font-mono">{parseFloat(selectedDetailTransaction.rounding_diff || 0) > 0 ? '+' : ''}{formatRupiah(parseFloat(selectedDetailTransaction.rounding_diff || 0))}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed border-slate-300 text-slate-900">
                                        <span>TOTAL TRANSAKSI</span>
                                        <span className="font-mono text-indigo-650">{formatRupiah(parseFloat(selectedDetailTransaction.total || 0))}</span>
                                    </div>

                                    {/* Uang Dibayar & Kembalian */}
                                    <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-600">
                                        <div className="flex justify-between">
                                            <span>Uang Dibayar</span>
                                            <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.paid_amount || 0))}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-slate-800">
                                            <span>Uang Kembalian</span>
                                            <span className="font-mono">{formatRupiah(parseFloat(selectedDetailTransaction.change_amount || 0))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="shrink-0 pt-3 border-t border-slate-100 flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                handleReprint(selectedDetailTransaction);
                            }}
                            variant="outline"
                            className="font-bold gap-1.5 h-10 border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
                        >
                            <Printer className="h-4 w-4 text-slate-500" /> Cetak Struk
                        </Button>
                        <Button
                            onClick={() => setShowDetailModal(false)}
                            className="flex-1 font-black h-10 bg-slate-900 hover:bg-slate-950 text-white"
                        >
                            Tutup Detail
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* STYLES KHUSUS UNTUK METODE CETAK STRUK PRINT BROWSER (THERMAL RECEIPT DESIGN) */}
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

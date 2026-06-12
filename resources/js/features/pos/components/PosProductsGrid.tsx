import { Search, Settings, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/helpers/format';

interface PosProductsGridProps {
    products: any[];
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredProducts: any[];
    handleAddToCart: (product: any) => void;
    posSettings: any;
    setPosSettings: (s: any) => void;
    handleSaveSettingsToDb: () => void;
    isSavingDb: boolean;
}

export function PosProductsGrid({
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleAddToCart,
    posSettings,
    setPosSettings,
    handleSaveSettingsToDb,
    isSavingDb
}: PosProductsGridProps) {
    return (
        <div className="xl:col-span-7 flex flex-col gap-4 h-full min-w-0">
            {/* Pencarian & Pengaturan */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-3 rounded-xl border shadow-sm shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="pos-search-input"
                        placeholder="Cari nama barang, kode SKU, atau scan barcode... (F2)"
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
                                                    checked={posSettings.activeMethods?.[m.key]}
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
                                                <SelectTrigger className="h-8 text-xs font-bold border-slate-200 focus:ring-slate-900 bg-white w-full">
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
                                                <SelectTrigger className="h-8 text-xs font-bold border-slate-200 focus:ring-slate-900 bg-white w-full">
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
                                className={`group relative flex flex-col bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-indigo-400 h-fit ${isOutOfStock ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
                                    }`}
                            >
                                {/* Foto / Visual Ringan */}
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
                                            className={`absolute top-1.5 right-1.5 border-0 text-[9px] font-extrabold px-1.5 py-0.5 ${isOutOfStock
                                                    ? 'bg-red-500 hover:bg-red-500 text-white'
                                                    : isLowStock
                                                        ? 'bg-amber-500 hover:bg-amber-500 text-white'
                                                        : 'bg-emerald-500 hover:bg-emerald-500 text-white'
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
                                        <span className="text-xs font-black text-indigo-600 font-semibold font-mono">
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
    );
}

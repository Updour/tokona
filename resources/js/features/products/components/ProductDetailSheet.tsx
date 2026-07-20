import { formatRupiah, formatNumber } from '@/lib/helpers/format';
import { AlignLeft, Barcode, Building2, ImageOff, Layers, MapPin, Tags, PackageOpen, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useProductStore } from '@/pages/products/stores/useProductStore';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState } from 'react';

export function ProductDetailSheet() {
    const { isDetailOpen, closeDetail, selectedProduct: product, openForm } = useProductStore();
    const [codeTab, setCodeTab] = useState<'barcode' | 'qrcode'>('barcode');

    if (!product) return null;

    return (
        <Sheet open={isDetailOpen} onOpenChange={closeDetail}>
            <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-xl">{product.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.is_bundle && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500 text-indigo-600 bg-indigo-50">Bundle</Badge>}
                        <span className="font-mono text-xs">{product.sku || '-'}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 space-y-6">
                        {/* Gambar Produk */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><ImageOff className="h-4 w-4" /> Galeri Produk</h4>
                            {product.images && product.images.length > 0 ? (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {product.images.sort((a, b) => a.sort_order - b.sort_order).map((img, idx) => (
                                        <div key={img.id} className="h-24 w-24 shrink-0 rounded-md border bg-muted overflow-hidden relative">
                                            <img src={img.url} alt={`Gambar ${idx}`} className="h-full w-full object-cover" />
                                            {img.is_primary && <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0 border-0 bg-yellow-500">Utama</Badge>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-24 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                                    <ImageOff className="h-5 w-5 mb-1 opacity-50" />
                                    <span className="text-xs">Tidak ada gambar</span>
                                </div>
                            )}
                        </div>

                        {/* Barcode & QR Code Tabs */}
                        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-900/30 p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    {codeTab === 'barcode' ? <Barcode className="h-4 w-4 text-indigo-500" /> : <QrCode className="h-4 w-4 text-indigo-500" />}
                                    Label & Kode Produk
                                </h4>
                                <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => setCodeTab('barcode')}
                                        className={`px-2 py-0.5 rounded transition-all font-semibold ${codeTab === 'barcode'
                                                ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-white'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        Barcode
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCodeTab('qrcode')}
                                        className={`px-2 py-0.5 rounded transition-all font-semibold ${codeTab === 'qrcode'
                                                ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-white'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        QR Code
                                    </button>
                                </div>
                            </div>

                            {/* Render Tab Content */}
                            {product.barcode ? (
                                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900/50 rounded-md border space-y-3">
                                    {codeTab === 'barcode' ? (
                                        <>
                                            <img
                                                src={`https://barcodeapi.org/api/128/${product.barcode}`}
                                                alt={`Barcode ${product.barcode}`}
                                                className="w-full h-20 object-fill dark:invert px-2"
                                            />
                                            <p className="font-mono text-[12px] font-bold tracking-widest text-slate-700 dark:text-slate-300 mt-2">{product.barcode}</p>
                                        </>
                                    ) : (
                                        <>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(product.barcode)}`}
                                                alt={`QR Code ${product.barcode}`}
                                                className="w-48 h-48 object-contain p-2 bg-white rounded shadow-sm border"
                                            />
                                            <p className="font-mono text-[12px] font-bold text-slate-700 dark:text-slate-300 mt-1">{product.barcode}</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900/50 rounded-md border border-dashed text-slate-500 space-y-2">
                                    <p className="text-xs text-center text-muted-foreground">Produk belum memiliki Kode Barcode.</p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                let randomBarcode = '';
                                                for (let i = 0; i < 12; i++) {
                                                    randomBarcode += Math.floor(Math.random() * 10).toString();
                                                }
                                                router.put(`/products/${product.id}`, {
                                                    branch_id: product.branch_id,
                                                    category_id: product.category_id,
                                                    type_id: product.type_id,
                                                    supplier_id: product.supplier_id,
                                                    name: product.name,
                                                    sku: product.sku,
                                                    barcode: randomBarcode,
                                                    description: product.description,
                                                    base_cost: product.base_cost,
                                                    sell_price: product.sell_price,
                                                    min_sell_price: product.min_sell_price,
                                                    track_stock: product.track_stock,
                                                    allow_negative_stock: product.allow_negative_stock,
                                                    is_bundle: product.is_bundle,
                                                    is_active: product.is_active,
                                                    expired_at: product.expired_at,
                                                }, {
                                                    onSuccess: () => {
                                                        toast.success('Barcode berhasil dibuat secara acak.');
                                                    }
                                                });
                                            }}
                                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 px-2.5 py-1.5 rounded transition-colors"
                                        >
                                            Generate Barcode
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openForm(product)}
                                            className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded transition-colors"
                                        >
                                            Input Manual
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Informasi Dasar */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Kategori</span>
                                <p className="font-medium">{product.category?.name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Tags className="h-3.5 w-3.5" /> Tipe Produk</span>
                                <p className="font-medium">{product.type?.name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Supplier</span>
                                <p className="font-medium">{product.source || '-'}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Harga & Stok */}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-4 rounded-lg border">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Harga Jual</span>
                                <p className="font-bold text-base text-primary">{formatRupiah(Number(product.sell_price))}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">HPP (Modal)</span>
                                <p className="font-medium">{formatRupiah(Number(product.base_cost))}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Sisa Stok</span>
                                <p className={`font-bold ${Number(product.current_stock) <= 5 ? 'text-destructive' : 'text-green-600'}`}>
                                    {formatNumber(product.current_stock)} {product.unit || 'Pcs'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Cabang</span>
                                <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {product.branch?.name || '-'}</p>
                            </div>
                        </div>

                        {/* Komponen Bundle */}
                        {product.is_bundle && product.bundleItems && product.bundleItems.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-700"><PackageOpen className="h-4 w-4" /> Komponen Paket</h4>
                                    <div className="rounded-lg border border-indigo-100 overflow-hidden text-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-indigo-50">
                                                <tr>
                                                    <th className="px-3 py-2 font-medium text-indigo-800 text-xs uppercase tracking-wide">Nama Barang</th>
                                                    <th className="px-3 py-2 font-medium text-indigo-800 text-xs uppercase tracking-wide w-24 text-center">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-indigo-100">
                                                {product.bundleItems.map((b: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2">{b.product?.name || `Produk ID: ${b.product_id}`}</td>
                                                        <td className="px-3 py-2 text-center font-medium">{b.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Deskripsi */}
                        {product.description && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><AlignLeft className="h-4 w-4" /> Deskripsi</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

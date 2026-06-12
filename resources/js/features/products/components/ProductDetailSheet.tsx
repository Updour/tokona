import { formatRupiah, formatNumber } from '@/lib/helpers/format';
import { AlignLeft, Barcode, Building2, ImageOff, Layers, MapPin, Tags } from 'lucide-react';
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

export function ProductDetailSheet() {
    const { isDetailOpen, closeDetail, selectedProduct: product } = useProductStore();

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

                        <Separator />

                        {/* Informasi Dasar */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Barcode className="h-3.5 w-3.5" /> Barcode</span>
                                <p className="font-medium font-mono">{product.barcode || '-'}</p>
                            </div>
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
                                    {formatNumber(product.current_stock)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Cabang</span>
                                <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {product.branch?.name || '-'}</p>
                            </div>
                        </div>

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

import { formatNumber } from '@/lib/helpers/format';
import { useForm } from '@inertiajs/react';
import { PackagePlus, TrendingUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProductStore } from '@/pages/products/stores/useProductStore';

const MOVEMENT_TYPES = [
    {
        value: 'IN',
        label: 'Barang Masuk (IN)',
        description: 'Stok baru dari pembelian atau penerimaan barang.',
        icon: TrendingUp,
        color: 'text-green-600',
    },
    {
        value: 'RETURN',
        label: 'Retur Masuk (RETURN)',
        description: 'Barang dikembalikan oleh pelanggan ke gudang.',
        icon: RotateCcw,
        color: 'text-blue-600',
    },
    {
        value: 'ADJUST',
        label: 'Penyesuaian (ADJUST)',
        description: 'Koreksi stok manual (opname, selisih, dll). Nilai bisa positif atau negatif.',
        icon: SlidersHorizontal,
        color: 'text-amber-600',
    },
] as const;

export function ProductRestockDialog() {
    const { isRestockOpen, selectedProduct, closeRestock } = useProductStore();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'IN' as 'IN' | 'ADJUST' | 'RETURN',
        qty: '',
        unit_cost: '',
        notes: '',
    });

    useEffect(() => {
        if (isRestockOpen && selectedProduct) {
            reset();
            setData('unit_cost', selectedProduct.base_cost?.toString() ?? '');
            clearErrors();
        }
    }, [isRestockOpen, selectedProduct]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
return;
}

        post(`/products/${selectedProduct.id}/restock`, {
            preserveScroll: true,
            onSuccess: () => closeRestock(),
        });
    };

    const selectedType = MOVEMENT_TYPES.find((t) => t.value === data.type);

    return (
        <Dialog open={isRestockOpen} onOpenChange={(open) => !open && closeRestock()}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackagePlus className="h-5 w-5 text-primary" />
                            Tambah / Sesuaikan Stok
                        </DialogTitle>
                        <DialogDescription>
                            {selectedProduct && (
                                <span>
                                    Produk: <strong>{selectedProduct.name}</strong>
                                    {' · '}
                                    Stok saat ini:{' '}
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {formatNumber(selectedProduct.current_stock)}
                                    </Badge>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Tipe pergerakan */}
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Tipe Pergerakan <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.type}
                                onValueChange={(v: any) => setData('type', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOVEMENT_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            <span className={`font-medium ${t.color}`}>{t.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedType && (
                                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-0.5">
                                    <selectedType.icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${selectedType.color}`} />
                                    {selectedType.description}
                                </p>
                            )}
                            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                        </div>

                        {/* Jumlah */}
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Jumlah <span className="text-destructive">*</span>
                                {data.type === 'ADJUST' && (
                                    <span className="ml-1 text-amber-600 normal-case font-normal">(positif = tambah, negatif = kurangi)</span>
                                )}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={data.type === 'ADJUST' ? undefined : 1}
                                    step="1"
                                    value={data.qty}
                                    onChange={(e) => setData('qty', e.target.value)}
                                    placeholder={data.type === 'ADJUST' ? 'e.g. 10 atau -5' : 'e.g. 50'}
                                    className="max-w-[160px] font-mono"
                                    required
                                />
                                <span className="text-sm text-muted-foreground">unit</span>
                            </div>
                            {errors.qty && <p className="text-xs text-destructive">{errors.qty}</p>}
                        </div>

                        {/* Harga satuan (opsional, untuk IN) */}
                        {data.type === 'IN' && (
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                    Harga Beli Satuan (Opsional)
                                </Label>
                                <div className="relative max-w-[200px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.unit_cost}
                                        onChange={(e) => setData('unit_cost', e.target.value)}
                                        className="pl-8"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan untuk pakai HPP produk saat ini.
                                </p>
                                {errors.unit_cost && <p className="text-xs text-destructive">{errors.unit_cost}</p>}
                            </div>
                        )}

                        {/* Catatan */}
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Catatan
                            </Label>
                            <Textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="e.g. Restock dari supplier PT ABC, No. PO: 2026/05/001"
                                className="h-20 resize-none"
                            />
                            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={closeRestock} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            {processing ? 'Menyimpan...' : 'Simpan Pergerakan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

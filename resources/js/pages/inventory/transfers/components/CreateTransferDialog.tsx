import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTransferStore } from '../stores/useTransferStore';

export default function CreateTransferDialog({ branches, products, currentBranchId, is_super_admin }: any) {
    const { isCreateOpen, closeCreate } = useTransferStore();
    const { data, setData, post, processing, reset, errors } = useForm({
        source_branch_id: is_super_admin ? '' : (currentBranchId || ''),
        destination_branch_id: '',
        notes: '',
        items: [] as { product_id: string; qty: number }[]
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);

    const availableBranches = branches.filter((b: any) => b.id !== currentBranchId);

    const handleAddItem = () => {
        if (!selectedProduct) return;

        const exists = data.items.find(item => item.product_id === selectedProduct);
        if (exists) {
            setData('items', data.items.map(item =>
                item.product_id === selectedProduct
                    ? { ...item, qty: item.qty + selectedQty }
                    : item
            ));
        } else {
            setData('items', [...data.items, { product_id: selectedProduct, qty: selectedQty }]);
        }

        setSelectedProduct('');
        setSelectedQty(1);
    };

    const handleRemoveItem = (productId: string) => {
        setData('items', data.items.filter(item => item.product_id !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            toast.error('Minimal tambahkan 1 produk untuk ditransfer');
            return;
        }

        post('/inventory/transfers', {
            onSuccess: () => {
                toast.success('Transfer berhasil dibuat');
                closeCreate();
                reset();
            },
            onError: () => {
                toast.error('Gagal membuat transfer. Periksa inputan Anda.');
            }
        });
    };

    const getProductName = (id: string) => products.find((p: any) => p.id === id)?.name || 'Unknown';

    return (
        <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-background">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Buat Transfer Antar Cabang
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                        Pilih cabang tujuan dan produk yang akan ditransfer. Status awal akan menjadi <span className="font-semibold text-foreground">DRAFT</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[80vh]">
                    <div className="px-6 py-5 overflow-y-auto space-y-6">
                        <div className="space-y-4">
                            {is_super_admin && (
                                <div className="space-y-2">
                                    <Label className="font-semibold">Cabang Asal <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={data.source_branch_id}
                                        onValueChange={(val) => setData('source_branch_id', val)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="-- Pilih Cabang Asal --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch: any) => (
                                                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.source_branch_id && <p className="text-sm text-destructive">{errors.source_branch_id}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="font-semibold">Cabang Tujuan <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.destination_branch_id}
                                    onValueChange={(val) => setData('destination_branch_id', val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Pilih Cabang Tujuan --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBranches.filter((b: any) => b.id !== data.source_branch_id).map((branch: any) => (
                                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.destination_branch_id && <p className="text-sm text-destructive">{errors.destination_branch_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Catatan (Opsional)</Label>
                                <Textarea
                                    placeholder="Tambahkan catatan khusus jika ada..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="border rounded-xl p-5 bg-muted/30 space-y-4 shadow-sm">
                                <Label className="font-semibold flex items-center justify-between">
                                    <span>Item Transfer <span className="text-destructive">*</span></span>
                                    <span className="text-xs font-normal text-muted-foreground">{data.items.length} item dipilih</span>
                                </Label>

                                <div className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                            <SelectTrigger className="bg-background w-full">
                                                <SelectValue placeholder="Cari Produk..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name} <span className="text-muted-foreground ml-1">(Stok: {p.current_stock || 0})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={selectedQty}
                                            onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                                            className="bg-background text-center"
                                        />
                                    </div>
                                    <Button type="button" onClick={handleAddItem} className="mb-0.5 gap-1 shadow-sm">
                                        <Plus className="w-4 h-4" /> Tambah
                                    </Button>
                                </div>

                                {/* List of items */}
                                {data.items.length > 0 && (
                                    <div className="mt-4 rounded-lg border bg-card overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Produk</th>
                                                    <th className="text-center py-3 px-4 w-24 font-semibold text-muted-foreground">Qty</th>
                                                    <th className="text-right py-3 px-4 w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.items.map((item, idx) => (
                                                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                                        <td className="py-3 px-4 font-medium">{getProductName(item.product_id)}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge variant="secondary" className="px-2 py-0.5 font-bold bg-primary/10 text-primary hover:bg-primary/20">
                                                                {item.qty}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2 px-3 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleRemoveItem(item.product_id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {errors.items && <p className="text-sm text-destructive mt-2">Item transfer wajib diisi.</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 px-6 py-4 border-t bg-muted/10 flex items-center justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={closeCreate} disabled={processing}>Batal</Button>
                        <Button type="submit" className="shadow-sm" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" /> Simpan Draft
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

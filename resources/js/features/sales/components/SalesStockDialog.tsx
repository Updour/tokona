import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Package, PlusCircle, AlertCircle, ArrowDownToLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SalesPerson } from '../types';

interface SalesStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedSales: SalesPerson | null;
    products: any[];
}

export function SalesStockDialog({ open, onOpenChange, selectedSales, products = [] }: SalesStockDialogProps) {
    const stockForm = useForm({
        sales_person_id: '',
        product_id: '',
        qty: '1',
    });

    useEffect(() => {
        if (selectedSales) {
            stockForm.setData('sales_person_id', selectedSales.id);
        }
    }, [selectedSales]);

    const handleLoadStock = (e: React.FormEvent) => {
        e.preventDefault();
        stockForm.post('/sales/load-stock', {
            onSuccess: () => {
                stockForm.reset('product_id', 'qty');
            },
        });
    };

    const [isUnloading, setIsUnloading] = React.useState(false);

    const handleUnloadStock = () => {
        if (!selectedSales) return;
        if (!confirm('Anda yakin ingin menarik semua sisa barang muatan di kendaraan sales ini kembali ke gudang?')) return;
        
        setIsUnloading(true);
        router.post('/sales/unload-stock', {
            sales_person_id: selectedSales.id
        }, {
            onFinish: () => setIsUnloading(false)
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl h-[90vh] md:h-[85vh] rounded-2xl p-6 md:p-8 border-slate-100 shadow-2xl flex flex-col justify-between overflow-hidden">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="flex items-center gap-2.5 text-indigo-650 text-xl font-black">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center shrink-0 border border-indigo-150">
                            <Package className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <span className="block text-indigo-950 font-black">Stok Canvas Sales: {selectedSales?.name}</span>
                            <span className="text-xs text-slate-500 font-bold block mt-1">Pantau barang bawaan di kendaraan sales dan muat barang baru dari gudang/cabang utama.</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 py-4 overflow-hidden min-h-0">
                    {/* List stok saat ini (Left - 6 Columns) */}
                    <div className="lg:col-span-6 flex flex-col h-full min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-indigo-650 rounded-full"></span>
                                Barang Bawaan Saat Ini (Mobil/Motor)
                            </h4>
                            <div className="flex gap-2">
                                <Badge className="bg-slate-100 text-slate-800 border-0 hover:bg-slate-100 text-[10px] font-extrabold px-2.5">
                                    {((selectedSales as any)?.loaded_stocks?.length || 0)} Jenis Produk
                                </Badge>
                                {(selectedSales as any)?.loaded_stocks?.some((ls: any) => ls.current_stock > 0) && (
                                    <Button 
                                        onClick={handleUnloadStock} 
                                        disabled={isUnloading}
                                        size="sm" 
                                        className="h-6 text-[10px] bg-rose-500 hover:bg-rose-600 text-white font-bold px-2 rounded-md"
                                    >
                                        <ArrowDownToLine className="h-3 w-3 mr-1" /> Tarik Muatan
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="border border-slate-100 rounded-xl bg-slate-50/30 flex-1 shadow-inner flex flex-col min-h-0 overflow-hidden">
                            <div className="overflow-y-auto flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="text-xs font-black text-slate-800 py-3.5 pl-4">Nama Produk</TableHead>
                                            <TableHead className="text-xs font-black text-slate-800 text-center py-3.5">Bawa</TableHead>
                                            <TableHead className="text-xs font-black text-slate-800 text-center py-3.5">Terjual</TableHead>
                                            <TableHead className="text-xs font-black text-slate-800 text-right py-3.5 pr-4">Sisa</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(selectedSales as any)?.loaded_stocks?.length > 0 ? (
                                            (selectedSales as any).loaded_stocks.map((ls: any) => (
                                                <TableRow key={ls.id} className="text-xs hover:bg-slate-50 transition-colors bg-white">
                                                    <TableCell className="font-black text-slate-800 py-3.5 pl-4 flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">📦</div>
                                                        {ls.product?.name ?? 'Produk'}
                                                    </TableCell>
                                                    <TableCell className="text-center py-3.5 font-bold text-slate-700">{ls.allocated_qty}</TableCell>
                                                    <TableCell className="text-center py-3.5 text-emerald-600 font-extrabold">{ls.sold_qty}</TableCell>
                                                    <TableCell className="text-right py-3.5 font-black text-indigo-655 pr-4 text-sm bg-indigo-50/20">
                                                        {ls.current_stock}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-semibold bg-white">
                                                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                                                    Belum ada barang di muatan sales.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Form tambah barang bawaan (Right - 6 Columns) */}
                    <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50/50 to-indigo-100/20 p-6 border border-indigo-100 rounded-2xl flex flex-col justify-between shadow-sm h-full overflow-y-auto">
                        <form onSubmit={handleLoadStock} className="h-full flex flex-col justify-between min-h-[300px]">
                            <div className="space-y-5">
                                <h4 className="text-xs font-black uppercase text-indigo-755 tracking-wider flex items-center gap-1.5">
                                    <PlusCircle className="h-4 w-4 text-indigo-600" /> Bawa Barang Baru Dari Gudang
                                </h4>

                                <div className="grid gap-2">
                                    <Label htmlFor="product_id" className="text-slate-700 font-extrabold text-xs">Pilih Produk Gudang Utama</Label>
                                    <Select
                                        value={stockForm.data.product_id}
                                        onValueChange={val => stockForm.setData('product_id', val)}
                                    >
                                        <SelectTrigger className="w-full bg-white border-slate-200 h-10 shadow-sm rounded-lg text-slate-800 text-xs font-semibold">
                                            <SelectValue placeholder="Pilih Produk di Gudang" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[220px]">
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="text-xs font-semibold">
                                                    {p.name} (Sisa Stok Gudang: {Number(p.current_stock ?? 0)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="qty" className="text-slate-700 font-extrabold text-xs">Jumlah Kuantitas (Qty)</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min="1"
                                        value={stockForm.data.qty}
                                        onChange={e => stockForm.setData('qty', e.target.value)}
                                        placeholder="Masukkan kuantitas yg dimuat, contoh: 10"
                                        className="bg-white border-slate-200 h-10 shadow-sm rounded-lg text-xs font-semibold"
                                        required
                                    />
                                </div>

                                {stockForm.errors.qty && <p className="text-xs text-red-500 font-bold">{stockForm.errors.qty}</p>}
                            </div>
                            <Button
                                type="submit"
                                className="w-full mt-6 bg-primary text-white font-extrabold text-xs h-10 shadow-md shadow-indigo-200"
                                disabled={stockForm.processing}
                            >
                                {stockForm.processing && <Spinner className="mr-2" />}
                                Muat ke Kendaraan Sales
                            </Button>
                        </form>
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
                    <div className="text-[10px] text-indigo-700 font-bold flex items-center gap-1.5 mr-auto">
                        <AlertCircle className="h-4 w-4 text-indigo-500 animate-pulse shrink-0" />
                        Sistem akan memotong persediaan stok gudang utama cabang Anda secara otomatis demi sinkronisasi mutasi.
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Undo2, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/helpers/format';

interface PosReturnsTabProps {
    transactions: any[];
    selectedReturnTxId: string;
    handleReturnTxChange: (txId: string) => void;
    returnItems: any[];
    handleReturnQtyChange: (productId: string, qty: number) => void;
    handleReturnQtyInputChange: (productId: string, qty: string) => void;
    handleProcessReturn: () => void;
    isSubmittingReturn: boolean;
}

export function PosReturnsTab({
    transactions,
    selectedReturnTxId,
    handleReturnTxChange,
    returnItems,
    handleReturnQtyChange,
    handleReturnQtyInputChange,
    handleProcessReturn,
    isSubmittingReturn
}: PosReturnsTabProps) {
    return (
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
    );
}

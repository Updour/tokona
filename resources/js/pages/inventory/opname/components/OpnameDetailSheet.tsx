import { useState } from 'react';
import { useOpnameStore } from '../stores/useOpnameStore';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PackageX, ArrowDown, ArrowUp, Calendar, User, FileText, CheckCircle2, TrendingUp, TrendingDown, ClipboardCheck, Clock, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export default function OpnameDetailSheet() {
    const { isDetailOpen, closeDetail, selectedOpname } = useOpnameStore();
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    if (!selectedOpname) return null;

    const totalSystem = selectedOpname.items?.reduce((sum: number, item: any) => sum + Number(item.system_stock), 0) || 0;
    const totalPhysical = selectedOpname.items?.reduce((sum: number, item: any) => sum + Number(item.physical_stock), 0) || 0;
    const totalDiff = totalPhysical - totalSystem;
    const itemsCount = selectedOpname.items?.length || 0;

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(`/inventory/opname/${selectedOpname.id}/approve`, {}, {
            onSuccess: () => {
                setShowApproveConfirm(false);
                closeDetail();
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleCancel = () => {
        setIsProcessing(true);
        router.post(`/inventory/opname/${selectedOpname.id}/cancel`, {
            cancel_reason: cancelReason
        }, {
            onSuccess: () => {
                setShowCancelConfirm(false);
                setCancelReason('');
                closeDetail();
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    return (
        <>
            <Sheet open={isDetailOpen} onOpenChange={closeDetail}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0 h-full">
                    <SheetHeader className="p-6 border-b shrink-0 bg-slate-50/50">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                    Detail Opname
                                    <Badge variant="outline" className="ml-2 font-mono bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs">
                                        {selectedOpname.reference_number}
                                    </Badge>
                                    {selectedOpname.status === 'draft' && (
                                        <Badge className="bg-amber-100 text-amber-700 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                            <Clock className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                    {selectedOpname.status === 'completed' && (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                            <CheckCircle2 className="h-3 w-3" /> Selesai
                                        </Badge>
                                    )}
                                    {selectedOpname.status === 'cancelled' && (
                                        <Badge className="bg-rose-100 text-rose-700 border-0 flex w-fit items-center gap-1 px-2 py-0.5">
                                            <XCircle className="h-3 w-3" /> Dibatalkan
                                        </Badge>
                                    )}
                                </SheetTitle>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span>Oleh <span className="font-semibold text-slate-700">{selectedOpname.creator?.name || 'Sistem'}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{new Date(selectedOpname.opname_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6 bg-slate-50/30">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center items-center text-center">
                                <div className="bg-slate-100 p-2 rounded-full mb-2">
                                    <PackageX className="h-5 w-5 text-slate-500" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Sistem</p>
                                <p className="text-2xl font-bold text-slate-800">{totalSystem}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center items-center text-center ring-1 ring-primary/20">
                                <div className="bg-primary/10 p-2 rounded-full mb-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Total Fisik</p>
                                <p className="text-2xl font-bold text-primary">{totalPhysical}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center items-center text-center">
                                <div className={`p-2 rounded-full mb-2 ${totalDiff > 0 ? 'bg-emerald-100 text-emerald-600' : totalDiff < 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {totalDiff > 0 ? <TrendingUp className="h-5 w-5" /> : totalDiff < 0 ? <TrendingDown className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Selisih</p>
                                <p className={`text-2xl font-bold ${totalDiff > 0 ? 'text-emerald-600' : totalDiff < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                    {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-bold text-slate-800">Catatan Opname</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {selectedOpname.notes || <span className="italic text-slate-400">Tidak ada catatan yang dilampirkan.</span>}
                            </p>
                        </div>

                        <div className="flex-1 border rounded-xl overflow-hidden flex flex-col">
                            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <PackageX className="h-4 w-4 text-slate-400" />
                                    Daftar Barang yang Diaudit
                                </h4>
                                <Badge variant="secondary" className="font-mono">{itemsCount} Item</Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                                        <TableRow>
                                            <TableHead className="font-bold">Nama Produk</TableHead>
                                            <TableHead className="font-bold text-center w-24">Stok Sistem</TableHead>
                                            <TableHead className="font-bold text-center w-24">Stok Fisik</TableHead>
                                            <TableHead className="font-bold text-center w-24">Selisih</TableHead>
                                            <TableHead className="font-bold">Alasan Selisih</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOpname.items?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                                    <PackageX className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                    Tidak ada item.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            selectedOpname.items?.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.product?.name || 'Produk Tidak Ditemukan'}
                                                        {item.product?.sku && (
                                                            <span className="block text-xs text-slate-400 font-mono mt-0.5">{item.product.sku}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center bg-slate-50/50">{item.system_stock}</TableCell>
                                                    <TableCell className="text-center font-bold text-primary bg-primary/5">{item.physical_stock}</TableCell>
                                                    <TableCell className="text-center">
                                                        {item.difference > 0 && (
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center justify-center gap-1 mx-auto hover:bg-emerald-100 w-full">
                                                                <ArrowUp className="h-3 w-3" /> +{item.difference}
                                                            </Badge>
                                                        )}
                                                        {item.difference < 0 && (
                                                            <Badge className="bg-rose-100 text-rose-700 border-0 flex items-center justify-center gap-1 mx-auto hover:bg-rose-100 w-full">
                                                                <ArrowDown className="h-3 w-3" /> {item.difference}
                                                            </Badge>
                                                        )}
                                                        {item.difference === 0 && (
                                                            <Badge variant="outline" className="text-slate-500 border-slate-200 justify-center w-full">
                                                                Cocok
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500">{item.reason || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {selectedOpname.status === 'draft' && (
                        <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-3 mt-auto shrink-0">
                            <Button variant="outline" onClick={() => setShowCancelConfirm(true)} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                                <XCircle className="w-4 h-4 mr-2" />
                                Batalkan
                            </Button>
                            <Button onClick={() => setShowApproveConfirm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Check className="w-4 h-4 mr-2" />
                                Setujui & Sesuaikan Stok
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Modal Konfirmasi Approve */}
            <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Setujui Stock Opname
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-600">
                            Apakah Anda yakin ingin menyetujui opname ini? <br /><br />
                            <span className="font-semibold text-slate-800">Tindakan ini akan merubah stok sistem secara permanen sesuai dengan hasil penghitungan fisik.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-3 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowApproveConfirm(false)}
                            disabled={isProcessing}
                        >
                            Tutup
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isProcessing ? 'Memproses...' : 'Ya, Setujui & Sesuaikan Stok'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Cancel */}
            <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <XCircle className="h-5 w-5" />
                            Batalkan Stock Opname
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-600">
                            Apakah Anda yakin ingin membatalkan draf opname ini? Data perhitungan akan ditandai sebagai dibatalkan dan stok tidak akan berubah.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-3 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={isProcessing}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isProcessing ? 'Memproses...' : 'Ya, Batalkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

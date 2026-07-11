import { useState } from 'react';
import { formatRupiah } from '@/lib/helpers/format';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, CheckCircle2, CircleDashed, Wallet, Building2, CalendarDays, Receipt, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';
import { PurchasePaymentDialog } from '@/features/purchases/components/PurchasePaymentDialog';
import { PurchasePaymentReceiptDialog } from '@/features/purchases/components/PurchasePaymentReceiptDialog';

interface Props {
    purchase: any;
}

export default function Show({ purchase }: Props) {
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
    const remainingBalance = Number(purchase.total_cost) - Number(purchase.amount_paid);

    const renderStatusBadge = (status: string) => {
        if (status === 'draft') {
            return <Badge variant="outline" className="text-muted-foreground"><CircleDashed className="mr-1 h-3 w-3" /> Draft (Direncanakan)</Badge>;
        }

        if (status === 'received') {
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Diterima</Badge>;
        }

        if (status === 'paid') {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Dokumen Selesai</Badge>;
        }

        return <Badge>{status}</Badge>;
    };

    const renderPaymentStatusBadge = (status: string) => {
        if (status === 'paid' || remainingBalance <= 0) {
            return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 uppercase">Lunas</Badge>;
        }
        if (status === 'partial') {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 uppercase">Cicilan / DP</Badge>;
        }
        return <Badge variant="destructive" className="uppercase">Belum Dibayar</Badge>;
    };

    return (
        <MainLayout>
            <Head title={`Invoice PO: ${purchase.invoice_number || 'Draft'}`} />

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/purchases"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            Purchase Order {purchase.invoice_number ? `#${purchase.invoice_number}` : '(Draft)'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Rincian detail dokumen pembelian dan riwayat pembayaran.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {renderStatusBadge(purchase.status)}
                    {purchase.status !== 'draft' && remainingBalance > 0 && (
                        <PurchasePaymentDialog purchase={purchase} remainingBalance={remainingBalance} />
                    )}
                    <Button variant="secondary" onClick={() => window.print()} className="hidden sm:flex shadow-sm">
                        <Printer className="mr-2 h-4 w-4" /> Cetak Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Paper Document */}
            <div id="invoice-print-area" className={`mx-auto max-w-5xl space-y-6 ${showPaymentReceipt ? 'print:hidden' : ''}`}>
                <Card className="shadow-lg border-border/50 overflow-hidden bg-white print:shadow-none print:border-none">
                    {/* Top Color Bar */}
                    <div className={`h-3 w-full ${remainingBalance > 0 ? 'bg-destructive' : 'bg-primary'}`} />

                    <CardContent className="p-8 sm:p-12">
                        {/* ─── Identitas ─── */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-muted">
                            <div className="space-y-4">
                                <h2 className={`text-3xl font-black tracking-tight uppercase ${remainingBalance > 0 ? 'text-destructive' : 'text-slate-800'}`}>INVOICE PEMBELIAN</h2>
                                <div className="text-sm text-slate-500 flex flex-col gap-2 mt-2">
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-primary" /> Tgl Pembelian:
                                        <strong className="text-slate-800">{new Date(purchase.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-primary" /> Status Barang:
                                        <strong className="text-slate-800 uppercase">{purchase.status}</strong>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-primary" /> Status Pembayaran:
                                        {renderPaymentStatusBadge(purchase.payment_status)}
                                    </span>
                                    {purchase.due_date && (
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-destructive" /> Jatuh Tempo:
                                            <strong className="text-destructive">{new Date(purchase.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:text-right space-y-1">
                                <span className="text-xs font-semibold text-primary tracking-widest uppercase mb-1">DITERBITKAN UNTUK CABANG:</span>
                                <h3 className="font-bold text-lg text-slate-800">{purchase.branch?.name || '-'}</h3>
                                <p className="text-sm text-slate-500 max-w-[250px] md:ml-auto leading-relaxed">{purchase.branch?.address || 'Alamat cabang belum diatur.'}</p>
                                <p className="text-sm text-slate-500 font-medium mt-1">{purchase.branch?.phone || ''}</p>
                            </div>
                        </div>

                        {/* ─── Supplier Info ─── */}
                        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> DARI SUPPLIER (PEMASOK)</span>
                                {purchase.supplier ? (
                                    <div className="space-y-1 mt-2">
                                        <h4 className="font-bold text-slate-800 text-lg">{purchase.supplier.name}</h4>
                                        <p className="text-sm text-slate-600">{purchase.supplier.address || '-'}</p>
                                        <p className="text-sm text-slate-600 font-medium">{purchase.supplier.phone || '-'}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic mt-2">Tidak ada data pemasok terkait dokumen ini.</p>
                                )}
                            </div>

                            <div className="flex flex-col justify-center items-start md:items-end p-5 rounded-xl border border-primary/10 bg-primary/5">
                                <span className="text-sm font-semibold text-primary/80 mb-2">RINGKASAN TAGIHAN</span>
                                <div className="w-full max-w-[280px] space-y-2">
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Total Belanja:</span>
                                        <span className="font-semibold">{formatRupiah(purchase.total_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-sm">
                                        <span>Sudah Dibayar:</span>
                                        <span className="font-semibold text-emerald-600">{formatRupiah(purchase.amount_paid)}</span>
                                    </div>
                                    <div className="h-px w-full bg-slate-200 my-2" />
                                    <div className="flex justify-between text-base">
                                        <span className="font-bold text-slate-800">Sisa Hutang:</span>
                                        <span className={`font-black tracking-tight ${remainingBalance > 0 ? 'text-destructive' : 'text-slate-800'}`}>
                                            {formatRupiah(remainingBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Tabel Item ─── */}
                        <div className="mt-4 mb-8 rounded-xl border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-slate-700">Nama Produk / Item</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[120px]">Qty</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[200px]">Harga Satuan</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right w-[200px]">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchase.items?.map((item: any) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 text-base">{item.product?.name || 'Produk Dihapus'}</span>
                                                    {item.product?.sku && <span className="text-xs text-slate-500 font-mono">SKU: {item.product.sku}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">{item.qty}</TableCell>
                                            <TableCell className="text-right text-slate-600">{formatRupiah(item.unit_cost)}</TableCell>
                                            <TableCell className="text-right font-bold text-slate-800">{formatRupiah(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* ─── Riwayat Pembayaran (Hutang) ─── */}
                        {purchase.payments && purchase.payments.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-primary" /> Riwayat Pembayaran
                                </h3>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="font-semibold">Tanggal</TableHead>
                                                <TableHead className="font-semibold">Metode</TableHead>
                                                <TableHead className="font-semibold">Catatan</TableHead>
                                                <TableHead className="font-semibold">Diterima Oleh</TableHead>
                                                <TableHead className="font-semibold text-right">Nominal Bayar</TableHead>
                                                <TableHead className="font-semibold text-center print:hidden w-[80px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchase.payments.map((payment: any) => (
                                                <TableRow key={payment.id} className="hover:bg-slate-50/50">
                                                    <TableCell>{new Date(payment.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                                                    <TableCell><Badge variant="outline">{payment.payment_method || '-'}</Badge></TableCell>
                                                    <TableCell className="text-slate-600 text-sm max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                                                    <TableCell>{payment.creator?.name || 'Sistem'}</TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600">{formatRupiah(payment.amount)}</TableCell>
                                                    <TableCell className="text-center print:hidden">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-500 hover:text-primary hover:bg-primary/10 h-8 w-8"
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowPaymentReceipt(true);
                                                            }}
                                                            title="Cetak Bukti Pelunasan"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* ─── Footer ─── */}
                        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                            <p>Dibuat oleh sistem otomatis Tokona pada {new Date(purchase.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                            <p className="font-semibold italic text-slate-400">Terima kasih atas kerja samanya.</p>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <PurchasePaymentReceiptDialog
                isOpen={showPaymentReceipt}
                onClose={() => setShowPaymentReceipt(false)}
                payment={selectedPayment}
                purchase={purchase}
            />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-print-area, #invoice-print-area *, 
                    #payment-receipt-print-area, #payment-receipt-print-area * {
                        visibility: visible;
                    }
                    #invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}

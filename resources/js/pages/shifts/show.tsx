import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, TrendingDown, Banknote, CreditCard, Receipt, AlertTriangle, QrCode, Building, Wallet, Percent, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ShiftSummary } from '@/features/shifts/types';
import MainLayout from '@/layouts/app/app-main-layout';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';

interface DetailedShiftSummary extends ShiftSummary {
    qris_sales?: number;
    transfer_sales?: number;
    total_hpp?: number;
    gross_profit?: number;
}

export default function ShiftShowPage(props: DetailedShiftSummary) {
    const { 
        shift, 
        total_sales, 
        cash_sales, 
        non_cash_sales, 
        qris_sales = 0,
        transfer_sales = 0,
        tx_count, 
        expected_balance, 
        difference,
        total_hpp = 0,
        gross_profit = 0
    } = props;
    
    const hasDifference = difference !== null && difference !== 0;
    const isPositive = (difference ?? 0) >= 0;

    return (
        <MainLayout>
            <Head title={`Laporan Shift — ${shift.user?.name}`} />
            
            <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-xl shrink-0">
                            <Link href="/shifts"><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Laporan End-of-Day (Shift)</h1>
                                <Badge variant={shift.status === 'open' ? 'default' : 'secondary'} className={shift.status === 'open' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                    {shift.status === 'open' ? 'Sedang Berjalan' : 'Selesai'}
                                </Badge>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 mt-1">
                                Kasir: <span className="text-slate-700">{shift.user?.name}</span> &bull; Cabang: <span className="text-slate-700">{shift.branch?.name}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" className="w-full md:w-auto flex items-center gap-2" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" /> Cetak Laporan
                        </Button>
                    </div>
                </div>

                {/* INFO WAKTU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-indigo-100 bg-indigo-50/30">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Waktu Buka Kasir</p>
                                <p className="text-base font-black text-slate-800 mt-0.5">{formatDateTime(shift.opened_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-slate-50/50">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu Tutup Kasir</p>
                                <p className="text-base font-black text-slate-800 mt-0.5">
                                    {shift.closed_at ? formatDateTime(shift.closed_at) : <span className="text-emerald-600 italic">Shift masih aktif</span>}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: METRICS & BREAKDOWN */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* MAIN STATS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendapatan Kotor</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardTitle className="text-xl md:text-2xl font-black text-emerald-700">{formatRupiah(total_sales)}</CardTitle>
                                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                                        <Receipt className="h-3 w-3" /> {tx_count} Struk Tercetak
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-cyan-100 shadow-sm bg-gradient-to-br from-cyan-50/50 to-white">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <Percent className="h-3 w-3" /> Laba Kotor
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardTitle className="text-xl md:text-2xl font-black text-cyan-700">{formatRupiah(gross_profit)}</CardTitle>
                                    <p className="text-[10px] text-cyan-600 font-semibold mt-1">Margin profit operasional</p>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-100 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Modal Terjual (HPP)</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardTitle className="text-xl md:text-2xl font-black text-amber-700">{formatRupiah(total_hpp)}</CardTitle>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
                                <CardHeader className="p-4 pb-2">
                                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Non-Tunai</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardTitle className="text-xl md:text-2xl font-black text-indigo-700">{formatRupiah(non_cash_sales)}</CardTitle>
                                </CardContent>
                            </Card>
                        </div>

                        {/* PAYMENT METHODS BREAKDOWN */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50 py-4">
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-slate-500" /> Rincian Metode Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <Banknote className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Uang Tunai (Cash)</p>
                                                <p className="text-xs text-slate-500">Diterima langsung di laci kasir</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-slate-800">{formatRupiah(cash_sales)}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <QrCode className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">QRIS / E-Wallet</p>
                                                <p className="text-xs text-slate-500">Ovo, Gopay, Dana, ShopeePay</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-slate-800">{formatRupiah(qris_sales)}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Building className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Transfer Bank</p>
                                                <p className="text-xs text-slate-500">BCA, Mandiri, BNI, BRI</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-slate-800">{formatRupiah(transfer_sales)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: RECONCILIATION */}
                    <div className="lg:col-span-4 space-y-6">
                        {shift.status === 'closed' ? (
                            <Card className="border-slate-200 shadow-md relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-black flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-indigo-600" /> Rekonsiliasi Kasir
                                    </CardTitle>
                                    <CardDescription>Perhitungan uang fisik di laci kasir pada saat tutup shift.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Uang Modal (Saldo Awal)</span>
                                            <span className="font-bold text-slate-700">{formatRupiah(shift.opening_balance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">+ Pendapatan Tunai</span>
                                            <span className="font-bold text-emerald-600">{formatRupiah(cash_sales)}</span>
                                        </div>
                                        <hr className="border-dashed" />
                                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                            <span className="text-sm font-bold text-slate-700">Total Ekspektasi Sistem</span>
                                            <span className="font-black text-indigo-700 text-lg">{formatRupiah(expected_balance)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-sm pt-2">
                                            <span className="text-slate-500 font-medium">Uang Fisik Dihitung Kasir</span>
                                            <span className="font-bold text-slate-800">{formatRupiah(shift.closing_balance ?? 0)}</span>
                                        </div>
                                    </div>

                                    {hasDifference && (
                                        <div className={`mt-4 p-4 rounded-xl border ${isPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {isPositive ? (
                                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                            <TrendingUp className="h-4 w-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className={`text-xs font-bold uppercase tracking-wider ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                            {isPositive ? 'Selisih Lebih (Surplus)' : 'Selisih Kurang (Minus)'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`text-xl font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {formatRupiah(Math.abs(difference ?? 0))}
                                                </p>
                                            </div>
                                            {!isPositive && (
                                                <p className="text-xs text-rose-600 mt-2 font-semibold">
                                                    ⚠️ Uang fisik di laci kurang dari catatan sistem. Kasir wajib melapor ke supervisor.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {!hasDifference && (
                                        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                <TrendingUp className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm font-bold text-emerald-700">Sempurna! Uang fisik seimbang (balance) dengan sistem.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-amber-800">Shift Belum Ditutup</h3>
                                    <p className="text-sm text-amber-700">Rekonsiliasi laci uang akan muncul setelah shift ditutup oleh kasir.</p>
                                </CardContent>
                            </Card>
                        )}

                        {shift.notes && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b bg-slate-50/50">
                                    <CardTitle className="text-sm font-bold text-slate-700">Catatan Tutup Kasir</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{shift.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .animate-in, .animate-in * {
                        visibility: visible;
                    }
                    .animate-in {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 100% !important;
                    }
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}

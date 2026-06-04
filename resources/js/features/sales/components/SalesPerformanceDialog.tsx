import React from 'react';
import { TrendingUp, MapPin, ShoppingBag, Target, Award, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesPerson } from '../types';

interface SalesPerformanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedSales: SalesPerson | null;
}

export function SalesPerformanceDialog({ open, onOpenChange, selectedSales }: SalesPerformanceDialogProps) {
    const visitsCount = selectedSales?.visits_count ?? 0;
    const ordersCount = selectedSales?.orders_count ?? 0;
    const conversionRate = visitsCount > 0 ? (ordersCount / visitsCount * 100).toFixed(0) : '0';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-4xl sm:max-w-4xl rounded-2xl p-6 border-slate-100 shadow-2xl overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="flex items-center gap-2.5 text-emerald-655 text-xl font-black">
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center shrink-0 border border-emerald-150">
                            <TrendingUp className="h-5.5 w-5.5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="block text-slate-900 font-black">Laporan Performa Lapangan</span>
                            <span className="text-xs text-slate-500 font-bold block mt-1">Personel Sales: {selectedSales?.name} (Cabang {selectedSales?.branch?.name})</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Grid Kartu Skor Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-4 rounded-2xl border border-indigo-850 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <MapPin size={80} />
                            </div>
                            <span className="block text-[10px] uppercase font-black text-indigo-300 tracking-wider">Total Kunjungan</span>
                            <span className="block text-2xl font-black mt-2">{visitsCount} Kali</span>
                            <span className="block text-[9px] text-indigo-200 mt-1 font-semibold">Toko mitra dikunjungi</span>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-550 to-emerald-800 text-white p-4 rounded-2xl border border-emerald-700 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <ShoppingBag size={80} />
                            </div>
                            <span className="block text-[10px] uppercase font-black text-emerald-200 tracking-wider">Transaksi Sukses</span>
                            <span className="block text-2xl font-black mt-2">{ordersCount} Order</span>
                            <span className="block text-[9px] text-emerald-105 mt-1 font-semibold">Canvas order closing</span>
                        </div>

                        <div className="bg-white border p-4 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Tingkat Konversi</span>
                            <span className="block text-2xl font-black mt-2 text-indigo-650">
                                {conversionRate}%
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                                <Target className="h-3 w-3 text-indigo-650" /> Target Konversi Ideal 70%
                            </span>
                        </div>
                    </div>

                    {/* Gamifikasi & Komisi Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border border-slate-100 rounded-2xl shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                                    <Award className="h-4 w-4 text-indigo-650" /> Skema Insentif & Komisi
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-slate-400 font-bold">Skema Aktif:</span>
                                        <span className="font-extrabold text-slate-850">
                                            {selectedSales?.commission_type === 'percent' ? 'Persentase Omset' : 'Nominal Per Transaksi'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-slate-400 font-bold">Nilai Komisi:</span>
                                        <span className="font-extrabold text-indigo-655">
                                            {selectedSales?.commission_type === 'percent' ? `${selectedSales?.commission_value}%` : `Rp ${Number(selectedSales?.commission_value).toLocaleString('id-ID')}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-slate-400 font-bold">Kategori Sales:</span>
                                        <Badge className="bg-indigo-600 hover:bg-indigo-650 text-white font-black text-[9px] border-0 py-0 px-2">
                                            Canvas Champion
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-indigo-100/10 rounded-2xl shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                                    <Zap className="h-4 w-4 text-amber-500 animate-bounce" /> Gamifikasi Medali Sales
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center font-black text-xl shadow-sm text-amber-600 shrink-0">
                                            🏆
                                        </div>
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">
                                                {ordersCount >= 3 ? 'Gold Achiever Medal' : 'Silver Sales Contender'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-semibold block">
                                                {ordersCount >= 3 ? 'Pencapaian konversi luar biasa di atas 80%' : 'Berpotensi meraih peringkat Gold hari ini!'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
                                        <div 
                                            className="bg-indigo-600 h-1.5 rounded-full" 
                                            style={{ width: `${Math.min((ordersCount / 5) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold block text-right">
                                        {ordersCount} dari 5 Closing Order Terverifikasi
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-100 pt-4">
                    <Button 
                        onClick={() => onOpenChange(false)}
                        className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs h-9 px-4 rounded-lg ml-auto"
                    >
                        Tutup Laporan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

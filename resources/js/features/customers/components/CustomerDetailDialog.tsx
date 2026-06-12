import { Eye, MapPin, Mail, Phone, Calendar, User, ShoppingCart, Tag, Coins, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCustomerStore } from '@/pages/customers/stores/useCustomerStore';
import { formatDateTime, formatTimeAgo } from '@/lib/helpers/date';
import { formatRupiah } from '@/lib/helpers/format';

export function CustomerDetailDialog() {
    const { isDetailOpen, closeDetail, selectedCustomer } = useCustomerStore();

    if (!selectedCustomer) {
        return null;
    }

    return (
        <Dialog open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
            <DialogContent className="max-w-2xl rounded-2xl p-6 border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 mb-4">
                    <DialogTitle className="flex items-center gap-2 text-indigo-655 font-black text-xl">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center shrink-0 border border-indigo-150">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="block text-slate-900 font-black">Detail Pelanggan</span>
                            <span className="text-xs text-slate-500 font-bold block mt-1">Informasi lengkap profil dan riwayat transaksi pelanggan.</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profil Singkat */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0 uppercase">
                            {selectedCustomer.name?.substring(0, 2)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                {selectedCustomer.name}
                                {selectedCustomer.is_active ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 px-2 text-[10px]">Aktif</Badge>
                                ) : (
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 px-2 text-[10px]">Nonaktif</Badge>
                                )}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    {selectedCustomer.phone || '-'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    {selectedCustomer.email || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Kiri */}
                        <div className="space-y-4">
                            <div className="bg-white border rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 mb-3">
                                    <Tag className="h-4 w-4 text-indigo-500" /> Klasifikasi
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Level (Tier)</div>
                                        <Badge variant="outline" className={`mt-1 font-extrabold ${selectedCustomer.tier === 'distributor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                selectedCustomer.tier === 'wholesale' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    selectedCustomer.tier === 'member' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {String(selectedCustomer.tier).toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Poin Reward</div>
                                        <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                                            <Coins className="h-4 w-4 text-amber-500" /> {selectedCustomer.points} Poin
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 mb-3">
                                    <MapPin className="h-4 w-4 text-emerald-500" /> Alamat
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {selectedCustomer.address || 'Alamat tidak tersedia.'}
                                </p>
                            </div>
                        </div>

                        {/* Kanan */}
                        <div className="space-y-4">
                            <div className="bg-white border rounded-xl p-4 shadow-sm border-rose-100 bg-rose-50/30">
                                <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5 mb-2">
                                    <RefreshCcw className="h-4 w-4 text-rose-500" /> Status Piutang
                                </h4>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Hutang Berjalan</div>
                                <div className="text-xl font-black text-rose-600 mt-0.5">
                                    {formatRupiah(selectedCustomer.debt_balance)}
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                                    Maksimal limit hutang: {formatRupiah(selectedCustomer.max_debt_limit)}
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 mb-3">
                                    <Calendar className="h-4 w-4 text-indigo-500" /> Aktivitas
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Terakhir Transaksi</div>
                                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                                            {selectedCustomer.last_transaction_at ? (
                                                <>
                                                    {formatDateTime(selectedCustomer.last_transaction_at)}
                                                    <span className="text-xs text-muted-foreground ml-2 font-medium">({formatTimeAgo(selectedCustomer.last_transaction_at)})</span>
                                                </>
                                            ) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tanggal Terdaftar</div>
                                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                                            {selectedCustomer.created_at ? formatDateTime(selectedCustomer.created_at).split(',')[0] : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedCustomer.notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5 mb-1.5">
                                Catatan Khusus
                            </h4>
                            <p className="text-sm text-amber-900 font-medium whitespace-pre-wrap">
                                {selectedCustomer.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={closeDetail} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9">
                        Tutup Detail
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

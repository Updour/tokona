import { Head, Link, router } from '@inertiajs/react';
import { Plus, Megaphone, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/helpers/format';

interface MarketingIndexProps {
    campaigns: any;
}

export default function MarketingIndex({ campaigns }: MarketingIndexProps) {
    const data = campaigns.data || [];

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Selesai</Badge>;
            case 'active': return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><PlayCircle className="w-3 h-3 mr-1"/> Berjalan</Badge>;
            case 'draft': return <Badge className="bg-slate-50 text-slate-700 border-slate-200"><AlertCircle className="w-3 h-3 mr-1"/> Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getAudienceLabel = (aud: string, pts: number) => {
        if (aud === 'all') return 'Semua Pelanggan';
        if (aud === 'tier_member') return 'Hanya Member';
        if (aud === 'tier_wholesale') return 'Hanya Grosir';
        if (aud === 'points_above_x') return `Poin > ${pts}`;
        return aud;
    };

    return (
        <MainLayout>
            <Head title="Marketing & Promo Broadcast" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-indigo-600" />
                        WhatsApp Broadcast
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Kirim pesan promo massal ke target pelanggan spesifik menggunakan WhatsApp Web.
                    </p>
                </div>
                <Link href="/business/marketing/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-md">
                        <Plus className="h-4 w-4" />
                        Buat Campaign Baru
                    </Button>
                </Link>
            </div>

            {data.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <Megaphone className="h-8 w-8 text-indigo-300" />
                    </div>
                    <h2 className="text-lg font-black text-slate-800">Belum Ada Campaign</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-md">
                        Mulai tingkatkan penjualan Anda dengan mengirimkan WhatsApp broadcast ke pelanggan loyal.
                    </p>
                    <Link href="/business/marketing/create" className="mt-6">
                        <Button className="bg-slate-900 text-white font-bold hover:bg-slate-800">
                            Mulai Campaign Pertama
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((c: any) => (
                        <Card key={c.id} className="p-5 flex flex-col justify-between border-slate-200 hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-black text-slate-800 text-lg line-clamp-1">{c.name}</h3>
                                    {getStatusBadge(c.status)}
                                </div>
                                <div className="text-xs text-slate-500 space-y-2 mb-4">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="font-semibold">Target</span>
                                        <span className="font-bold text-slate-700">{getAudienceLabel(c.target_audience, c.min_points)}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="font-semibold">Tanggal</span>
                                        <span className="font-bold text-slate-700">{formatDateTime(c.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Terkirim</span>
                                        <span className="font-black text-indigo-600">{c.sent_count} / {c.total_target}</span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                                    <div 
                                        className="bg-indigo-600 h-1.5 rounded-full" 
                                        style={{ width: `${c.total_target > 0 ? (c.sent_count / c.total_target) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <Link href={`/business/marketing/${c.id}`} className="w-full">
                                <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                                    Lihat Antrean Broadcast
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}

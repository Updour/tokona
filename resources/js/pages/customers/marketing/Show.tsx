import { Head, Link, router } from '@inertiajs/react';
import { Megaphone, ArrowLeft, Send, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import { formatNumber } from '@/lib/helpers/format';
import { useMarketingStore } from './stores/useMarketingStore';
import { toast } from 'sonner';

interface MarketingShowProps {
    campaign: any;
    queue: any[];
}

export default function MarketingShow({ campaign, queue }: MarketingShowProps) {
    const { sentIds, sentCount, initializeQueue, markAsSent, resetStore } = useMarketingStore();

    useEffect(() => {
        initializeQueue(campaign.id, campaign.sent_count || 0);

        return () => {
            resetStore();
        };
    }, [campaign.id, campaign.sent_count, initializeQueue, resetStore]);

    const handleSendWA = (item: any) => {
        // Format nomor HP (ganti 0 di depan jadi 62)
        let phone = item.phone.replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        const text = encodeURIComponent(item.message);
        const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
        
        // Buka tab baru WA Web
        window.open(waUrl, '_blank');

        // Mark as sent in Zustand store
        markAsSent(item.customer_id);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Teks pesan telah disalin ke clipboard.");
    };

    return (
        <MainLayout>
            <Head title={`Broadcast: ${campaign.name}`} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/business/marketing">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 text-slate-500 hover:text-slate-800">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            {campaign.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Kirim pesan langsung ke antrean menggunakan WhatsApp Web Anda.
                        </p>
                    </div>
                </div>
                
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="text-center">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Target</span>
                        <span className="font-black text-slate-800">{queue.length}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="text-center">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Terkirim</span>
                        <span className="font-black text-indigo-600">{sentCount}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {queue.map((item, index) => {
                    const isSent = sentIds.has(item.customer_id);

                    return (
                        <Card key={index} className={`p-4 border-2 transition-all flex flex-col justify-between ${isSent ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                                        <span className="text-xs font-bold text-slate-500 block">{item.phone}</span>
                                    </div>
                                    {isSent ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-1.5 py-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400 border-slate-200 px-1.5 py-0">
                                            <AlertCircle className="w-3 h-3" />
                                        </Badge>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                        {formatNumber(item.points)} Poin
                                    </span>
                                </div>
                                <div className="relative group">
                                    <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-4 h-[84px] whitespace-pre-wrap font-mono">
                                        {item.message}
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(item.message)}
                                        className="absolute top-1 right-1 p-1 bg-white rounded shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <Button 
                                    onClick={() => handleSendWA(item)}
                                    variant={isSent ? "outline" : "default"}
                                    className={`w-full font-bold gap-2 text-xs h-9 ${!isSent ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                                >
                                    {isSent ? (
                                        <>Kirim Ulang</>
                                    ) : (
                                        <><Send className="w-3 h-3" /> Kirim WhatsApp</>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            
            {queue.length === 0 && (
                <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-black text-slate-800">Tidak ada target pelanggan</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Coba ubah filter target Anda, sepertinya tidak ada pelanggan yang cocok atau tidak ada yang memiliki nomor HP.
                    </p>
                </div>
            )}
        </MainLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { Megaphone, ArrowLeft, Save, HelpCircle, Users } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function MarketingCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        target_audience: 'all',
        min_points: 0,
        message_template: 'Halo [NAMA], Poin Anda saat ini adalah [POIN] Pts.\n\nYuk segera tukarkan poin Anda dengan diskon menarik di Tokona!'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/business/marketing');
    };

    const insertVariable = (variable: string) => {
        setData('message_template', data.message_template + ` [${variable}]`);
    };

    return (
        <MainLayout>
            <Head title="Buat Campaign Promo" />

            <div className="flex items-center gap-3 mb-6">
                <Link href="/business/marketing">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        Buat Campaign Baru
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Filter target penerima dan buat pesan penawaran yang menarik.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-indigo-500" />
                            Informasi Campaign
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-xs font-bold text-slate-700">Nama Campaign</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: Promo Akhir Tahun Member VIP"
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="target_audience" className="text-xs font-bold text-slate-700">Target Pelanggan</Label>
                                    <Select 
                                        value={data.target_audience} 
                                        onValueChange={v => setData('target_audience', v)}
                                    >
                                        <SelectTrigger className="mt-1 bg-white">
                                            <SelectValue placeholder="Pilih Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Pelanggan (Ada Nomor WA)</SelectItem>
                                            <SelectItem value="tier_member">Hanya Tier: Member</SelectItem>
                                            <SelectItem value="tier_wholesale">Hanya Tier: Grosir</SelectItem>
                                            <SelectItem value="points_above_x">Berdasarkan Minimum Poin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.target_audience === 'points_above_x' && (
                                    <div>
                                        <Label htmlFor="min_points" className="text-xs font-bold text-slate-700">Minimum Poin</Label>
                                        <Input
                                            id="min_points"
                                            type="number"
                                            min="0"
                                            value={data.min_points}
                                            onChange={e => setData('min_points', parseInt(e.target.value) || 0)}
                                            className="mt-1"
                                        />
                                        {errors.min_points && <p className="text-xs text-red-500 mt-1 font-medium">{errors.min_points}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                                Pesan WhatsApp
                            </h2>
                            <div className="flex gap-1.5">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => insertVariable('NAMA')}
                                    className="h-7 text-[10px] font-bold"
                                >
                                    + [NAMA]
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => insertVariable('POIN')}
                                    className="h-7 text-[10px] font-bold"
                                >
                                    + [POIN]
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => insertVariable('TIER')}
                                    className="h-7 text-[10px] font-bold"
                                >
                                    + [TIER]
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Textarea
                                value={data.message_template}
                                onChange={e => setData('message_template', e.target.value)}
                                className="min-h-[200px] font-mono text-xs resize-y"
                                placeholder="Ketik pesan promosi di sini..."
                            />
                            {errors.message_template && <p className="text-xs text-red-500 mt-1 font-medium">{errors.message_template}</p>}
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                                <HelpCircle className="h-3 w-3" /> Gunakan *teks* untuk bold, _teks_ untuk italic sesuai format WhatsApp.
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="p-5 border-indigo-100 bg-indigo-50 shadow-sm text-indigo-900">
                        <h3 className="font-black text-sm flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-indigo-600" />
                            Cara Kerja Broadcast
                        </h3>
                        <p className="text-xs font-medium text-indigo-700/80 leading-relaxed mb-3">
                            Setelah disimpan, sistem akan menyeleksi pelanggan yang memenuhi syarat. Anda bisa mengirim pesan satu-per-satu via WhatsApp Web di halaman Antrean tanpa perlu mendaftar API berbayar.
                        </p>
                        <Button 
                            disabled={processing} 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-md"
                        >
                            <Save className="h-4 w-4" />
                            Simpan & Buat Antrean
                        </Button>
                    </Card>
                </div>
            </form>
        </MainLayout>
    );
}

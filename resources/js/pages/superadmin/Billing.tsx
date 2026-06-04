import { Head } from '@inertiajs/react';
import { Shield, CreditCard, Users, Landmark, Activity, Calendar, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import MainLayout from '@/layouts/app/app-main-layout';

interface BillingProps {
    stats: {
        free_stores: number;
        pro_stores: number;
        enterprise_stores: number;
        total_stores: number;
        mrr: number;
    };
    recentTransactions: Array<{
        name: string;
        plan: string;
        status: string;
        expires_at: string;
        updated_at: string;
    }>;
}

export default function Billing({ stats, recentTransactions }: BillingProps) {
    // Format currency to Rupiah
    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <MainLayout>
            <Head title="Billing & Paket SaaS" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                        <Landmark className="h-6 w-6 text-indigo-600" />
                        Billing & Paket Tokona SaaS
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Laporan keuangan, pendapatan bulanan (MRR), dan aktivitas paket toko klien Anda.
                    </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="relative overflow-hidden border-indigo-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-600" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Monthly Recurring Revenue (MRR)
                            </CardTitle>
                            <Landmark className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {formatRupiah(stats.mrr)}
                            </div>
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                                <ArrowUpRight className="h-3 w-3" />
                                Estimasi Real-time platform
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-violet-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-violet-600" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Toko Paket PRO
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-violet-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.pro_stores} <span className="text-sm font-normal text-slate-400">toko</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Langganan aktif (Rp 199k/bln)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-pink-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 to-pink-600" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Toko Paket ENTERPRISE
                            </CardTitle>
                            <Shield className="h-4 w-4 text-pink-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.enterprise_stores} <span className="text-sm font-normal text-slate-400">toko</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Langganan premium (Rp 499k/bln)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-slate-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-slate-400 to-slate-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Toko Paket FREE (Trial)
                            </CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.free_stores} <span className="text-sm font-normal text-slate-400">toko</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Total toko aktif uji coba gratis
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Activity */}
                <Card className="border-slate-150 bg-white/80 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-indigo-500" />
                                    Aktivitas Langganan Terbaru
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Daftar toko klien yang baru melakukan perpanjangan paket atau registrasi.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                                        <th className="px-6 py-3">Nama Toko</th>
                                        <th className="px-6 py-3">Paket Aktif</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Tanggal Berakhir</th>
                                        <th className="px-6 py-3">Pembaruan Terakhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {recentTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                                Belum ada aktivitas transaksi paket terdeteksi.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransactions.map((store, i) => (
                                            <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="px-6 py-3.5 font-bold text-slate-800">
                                                    {store.name}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant={
                                                            store.plan === 'enterprise' ? 'default' :
                                                            store.plan === 'pro' ? 'secondary' :
                                                            'outline'
                                                        }
                                                        className="capitalize font-semibold text-[10px] tracking-wide"
                                                    >
                                                        {store.plan}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant={store.status === 'active' ? 'outline' : 'destructive'}
                                                        className={`font-semibold text-[10px] ${
                                                            store.status === 'active' 
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                                                : ''
                                                        }`}
                                                    >
                                                        {store.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-600 font-mono text-[11px] flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {store.expires_at ? new Date(store.expires_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    }) : 'Selamanya'}
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                                                    {new Date(store.updated_at).toLocaleDateString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

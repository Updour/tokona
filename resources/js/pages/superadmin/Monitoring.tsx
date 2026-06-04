import { Head } from '@inertiajs/react';
import { Building2, Package, Users, ShieldAlert, Activity, GitBranch, MapPin, ExternalLink } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/app-main-layout';

interface MonitoringProps {
    stats: {
        stores: number;
        branches: number;
        products: number;
        users: number;
    };
    activeStores: {
        data: Array<{
            id: string;
            name: string;
            slug: string;
            email: string;
            phone: string;
            status: string;
            plan: string;
            location?: {
                city: string;
                province: string;
            };
            created_at: string;
        }>;
        links: any;
    };
}

export default function Monitoring({ stats, activeStores }: MonitoringProps) {
    return (
        <MainLayout>
            <Head title="Monitoring Toko Platform" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                        <Activity className="h-6 w-6 text-emerald-600" />
                        Monitoring Toko & Platform
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pemantauan real-time performa platform, jumlah data, dan sebaran geografis toko klien.
                    </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-emerald-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Toko Terdaftar
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.stores} <span className="text-sm font-normal text-slate-400">toko</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Tenant aktif di seluruh server
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sky-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Cabang Terdistribusi
                            </CardTitle>
                            <GitBranch className="h-4 w-4 text-sky-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.branches} <span className="text-sm font-normal text-slate-400">cabang</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Outlet fisik yang terafiliasi
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Produk Diupload
                            </CardTitle>
                            <Package className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.products} <span className="text-sm font-normal text-slate-400">item</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Jumlah database katalog produk
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Pengguna Aktif
                            </CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stats.users} <span className="text-sm font-normal text-slate-400">staf</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Akun kasir, admin, dan owner aktif
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Stores */}
                <Card className="border-slate-150 bg-white/80 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <div className="space-y-0.5">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                Pemantauan Status Toko Klien
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Seluruh data registrasi, domisili, dan status operational real-time toko klien.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                                        <th className="px-6 py-3">Nama Toko / Perusahaan</th>
                                        <th className="px-6 py-3">Rincian Kontak</th>
                                        <th className="px-6 py-3">Domisili Kota</th>
                                        <th className="px-6 py-3">Paket Langganan</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Tanggal Gabung</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {activeStores.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                                Belum ada toko yang terdaftar di platform.
                                            </td>
                                        </tr>
                                    ) : (
                                        activeStores.data.map((store, i) => (
                                            <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-slate-800 flex items-center gap-1">
                                                            {store.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            slug: {store.slug}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex flex-col gap-0.5 text-slate-500">
                                                        <span>{store.email || '-'}</span>
                                                        <span className="text-[10px]">{store.phone || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-600">
                                                    {store.location ? (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                            {store.location.city || '-'}, {store.location.province || '-'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Belum diatur</span>
                                                    )}
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
                                                        className={`font-semibold text-[10px] ${store.status === 'active'
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                                : ''
                                                            }`}
                                                    >
                                                        {store.status === 'active' ? 'Aktif' : 'Suspended'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                                                    {new Date(store.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
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

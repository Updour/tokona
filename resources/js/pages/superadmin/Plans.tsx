import { Head, Link } from '@inertiajs/react';
import { Check, X, Shield, Star, Zap, Building2, Store } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Plans() {
    return (
        <MainLayout>
            <Head title="Manajemen Paket SaaS" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Definisi Paket & Limitasi SaaS
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Halaman referensi khusus Super Admin yang menampilkan daftar batasan limitasi yang diterapkan oleh sistem secara otomatis pada setiap toko klien berdasarkan paket langganan mereka.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Free Plan */}
                    <Card className="relative flex flex-col border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[4px] bg-slate-400 rounded-t-xl" />
                        <CardHeader className="text-center pb-4 pt-8">
                            <CardTitle className="text-xl font-black text-slate-800">FREE TRIAL</CardTitle>
                            <CardDescription className="text-xs font-semibold text-slate-500 mt-2">
                                Paket dasar untuk uji coba platform
                            </CardDescription>
                            <div className="mt-4 flex items-center justify-center gap-1">
                                <span className="text-4xl font-black text-slate-900">Rp 0</span>
                                <span className="text-sm text-slate-500 font-semibold self-end mb-1">/ bulan</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Maksimal <strong>1 Cabang</strong> Toko</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Maksimal <strong>3 Karyawan</strong></span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Maksimal <strong>100 Produk</strong> Master</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Fitur POS Dasar</span>
                                </li>
                                <li className="flex items-center gap-2 opacity-50">
                                    <X className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span className="line-through">Integrasi Digital Struk WA</span>
                                </li>
                                <li className="flex items-center gap-2 opacity-50">
                                    <X className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span className="line-through">Laporan Finansial Advanced</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="relative flex flex-col border-indigo-200 bg-indigo-50/30 backdrop-blur-sm shadow-md transition-all hover:shadow-lg scale-105 z-10 ring-1 ring-indigo-500/20">
                        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />
                        
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3" fill="currentColor" />
                            Paling Populer
                        </div>

                        <CardHeader className="text-center pb-4 pt-8">
                            <CardTitle className="text-xl font-black text-indigo-900">PRO</CardTitle>
                            <CardDescription className="text-xs font-semibold text-indigo-600/70 mt-2">
                                Untuk bisnis UMKM yang sedang berkembang
                            </CardDescription>
                            <div className="mt-4 flex items-center justify-center gap-1">
                                <span className="text-4xl font-black text-indigo-950">199rb</span>
                                <span className="text-sm text-indigo-600/70 font-semibold self-end mb-1">/ bulan</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-slate-700">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>Maksimal <strong>3 Cabang</strong> Toko</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>Maksimal <strong>15 Karyawan</strong></span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>Maksimal <strong>1,000 Produk</strong> Master</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span className="font-bold text-indigo-900">Digital Struk WhatsApp</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>Laporan Finansial Advanced</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Enterprise Plan */}
                    <Card className="relative flex flex-col border-rose-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-rose-400 to-pink-500 rounded-t-xl" />
                        <CardHeader className="text-center pb-4 pt-8">
                            <CardTitle className="text-xl font-black text-slate-800">ENTERPRISE</CardTitle>
                            <CardDescription className="text-xs font-semibold text-slate-500 mt-2">
                                Akses tanpa batas untuk franchise besar
                            </CardDescription>
                            <div className="mt-4 flex items-center justify-center gap-1">
                                <span className="text-4xl font-black text-slate-900">499rb</span>
                                <span className="text-sm text-slate-500 font-semibold self-end mb-1">/ bulan</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span className="font-bold text-slate-900">Cabang Tidak Terbatas</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span className="font-bold text-slate-900">Karyawan Tidak Terbatas</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span className="font-bold text-slate-900">Produk Tidak Terbatas</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Digital Struk WhatsApp</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Laporan Finansial Advanced</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Prioritas Dukungan Teknis</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Notice */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Manajemen Tenant / Toko</h4>
                        <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                            Batasan di atas diatur secara permanen di dalam sistem (SubscriptionService). 
                            Untuk mengubah paket klien atau memperpanjang masa aktif (expires_at) sebuah toko, 
                            silakan tuju halaman Manajemen Tenant.
                        </p>
                        <Button asChild variant="default" size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-sm h-8">
                            <Link href="/tenants">
                                <Store className="h-3.5 w-3.5 mr-1.5" />
                                Buka Manajemen Tenant & Paket
                            </Link>
                        </Button>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}

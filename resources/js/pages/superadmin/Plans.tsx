import { Head, Link } from '@inertiajs/react';
import { Check, X, Shield, Star, Zap, Building2, Store } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import MainLayout from '@/layouts/app/app-main-layout';
import PlanFormDialog from './components/PlanFormDialog';

export default function Plans({ plans }: { plans: any[] }) {
    const [selectedPlan, setSelectedPlan] = React.useState<any>(null);

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
                    {plans.map((plan: any) => (
                        <Card key={plan.id} className="relative flex flex-col border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                            <div className={`absolute top-0 left-0 w-full h-[4px] rounded-t-xl ${plan.slug === 'pro' ? 'bg-indigo-500' : plan.slug === 'enterprise' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                            <CardHeader className="text-center pb-4 pt-8">
                                <CardTitle className="text-xl font-black text-slate-800 uppercase">{plan.name}</CardTitle>
                                <CardDescription className="text-xs font-semibold text-slate-500 mt-2">
                                    {plan.description}
                                </CardDescription>
                                <div className="mt-4 flex items-center justify-center gap-1">
                                    <span className="text-4xl font-black text-slate-900">Rp {Number(plan.price).toLocaleString('id-ID')}</span>
                                    <span className="text-sm text-slate-500 font-semibold self-end mb-1">/ bulan</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Maksimal <strong>{plan.max_branches === 999999 ? 'Tanpa Batas' : plan.max_branches} Cabang</strong> Toko</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Maksimal <strong>{plan.max_users === 999999 ? 'Tanpa Batas' : plan.max_users} Karyawan</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Maksimal <strong>{plan.max_products === 999999 ? 'Tanpa Batas' : plan.max_products} Produk</strong></span>
                                    </li>
                                    
                                    {(Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])).map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full bg-white hover:bg-slate-50 border-dashed" onClick={() => setSelectedPlan(plan)}>
                                    Edit Paket
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <PlanFormDialog 
                plan={selectedPlan} 
                isOpen={!!selectedPlan} 
                onClose={() => setSelectedPlan(null)} 
            />

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
        </MainLayout>
    );
}

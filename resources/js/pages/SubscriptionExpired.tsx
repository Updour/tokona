import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, LogOut, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionExpired() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
            <Head title="Masa Aktif Habis" />

            {/* Glowing background highlights */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 flex flex-col items-center text-center gap-6">
                
                {/* Warning Icon with pulse effect */}
                <div className="relative">
                    <div className="absolute inset-0 bg-destructive/20 rounded-full blur-md animate-ping" />
                    <div className="h-16 w-16 bg-gradient-to-tr from-destructive to-red-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                        <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Masa Aktif Akun Habis</h1>
                    <p className="text-sm text-slate-400 leading-relaxed px-2">
                        Masa uji coba (*trial*) atau paket langganan toko Anda telah berakhir. Seluruh operasional POS, produk, dan inventori telah ditangguhkan sementara demi keamanan data Anda.
                    </p>
                </div>

                <div className="w-full bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-left space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">STATUS OPERASIONAL</span>
                        <span className="font-bold text-destructive px-2 py-0.5 rounded bg-destructive/10 border border-destructive/20 uppercase tracking-wide">Ditangguhkan</span>
                    </div>
                    <div className="border-t border-slate-800/50 my-2" />
                    <p className="text-xs text-slate-400 leading-normal">
                        Untuk memulihkan akses penuh ke sistem kasir, data produk, dan menu keuangan, silakan hubungi Administrator Utama (*Super Admin*) atau lakukan pembaruan paket langganan Anda.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button 
                        asChild
                        className="flex-1 bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary/90 text-white font-medium gap-2 py-5"
                    >
                        <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer">
                            <PhoneCall className="h-4 w-4" /> Hubungi Super Admin
                        </a>
                    </Button>

                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="flex-1 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:text-white font-medium gap-2 py-5"
                    >
                        <LogOut className="h-4 w-4" /> Logout Akun
                    </Button>
                </div>
            </div>

            <div className="mt-6 text-xs text-slate-600 font-mono tracking-wider">
                TOKONA POS & ERP SaaS SYSTEM &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
}

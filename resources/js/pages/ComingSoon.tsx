import { Head } from '@inertiajs/react';
import { Construction, Sparkles } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComingSoonProps {
    title?: string;
    description?: string;
}

export default function ComingSoon({ 
    title = 'Fitur Sedang Dibangun', 
    description = 'Kami sedang menyiapkan fitur ini untuk meningkatkan pengalaman aplikasi Anda. Nantikan pembaruannya segera!' 
}: ComingSoonProps) {
    return (
        <MainLayout>
            <Head title={title} />
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
                <Card className="w-full max-w-md shadow-xl border-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-sm">
                    <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <CardContent className="pt-10 pb-10 flex flex-col items-center text-center px-8 space-y-6">
                        <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center border-8 border-white shadow-sm relative">
                            <Construction className="h-10 w-10 text-indigo-600 animate-pulse" />
                            <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                {description}
                            </p>
                        </div>

                        <Button 
                            variant="outline" 
                            className="mt-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
                            onClick={() => window.history.back()}
                        >
                            Kembali ke Halaman Sebelumnya
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

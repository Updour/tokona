import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/app-main-layout';

export default function Error({ message }: { message: string }) {
    return (
        <MainLayout>
            <Head title="Akses Ditolak - Canvas" />
            
            <div className="flex items-center justify-center min-h-[70vh]">
                <Card className="w-full max-w-md shadow-lg border-rose-100 bg-rose-50/30">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-slate-800">Akses Terbatas</CardTitle>
                        <CardDescription className="text-slate-600">
                            Terjadi kendala dalam mengakses modul ini.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center pt-4 pb-6">
                        <p className="text-sm font-medium text-rose-800 bg-rose-100/50 p-4 rounded-lg border border-rose-200">
                            {message || 'Anda tidak memiliki hak akses yang memadai ke modul ini.'}
                        </p>
                    </CardContent>
                    
                    <CardFooter className="flex justify-center pb-8">
                        <Link href="/dashboard">
                            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}

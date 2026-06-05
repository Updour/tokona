import { Head } from '@inertiajs/react';
import { Navigation } from 'lucide-react';
import { SalesMapDetail } from '@/features/sales/components/SalesMapDetail';
import MainLayout from '@/layouts/app/app-main-layout';

interface SalesMapProps {
    locations: any[];
    activeVisits: any[];
}

export default function SalesMap({ locations = [], activeVisits = [] }: SalesMapProps) {
    return (
        <MainLayout>
            <Head title="Peta Lokasi & Rute Sales" />

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Navigation className="h-6 w-6 text-indigo-650 animate-bounce" />
                    Peta Lokasi & Rute Sales
                </h1>
                <p className="text-sm text-muted-foreground">
                    Visualisasikan rute kunjungan, koordinat GPS outlet, dan wilayah pemasaran secara real-time.
                </p>
            </div>

            <SalesMapDetail locations={locations} activeVisits={activeVisits} />
        </MainLayout>
    );
}

import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { OpenShiftDialog } from '@/features/shifts/components/OpenShiftDialog';
import { ShiftTable } from '@/features/shifts/components/ShiftTable';
import MainLayout from '@/layouts/app/app-main-layout';

export default function ShiftsIndexPage({ shifts, filters }: { shifts: any; filters: any }) {
    return (
        <MainLayout>
            <Head title="Shift Kasir" />
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Clock className="h-6 w-6" />
                        Riwayat Shift Kasir
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola buka/tutup shift dan pantau rekonsiliasi kas harian.
                    </p>
                </div>
                <OpenShiftDialog />
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <ShiftTable shifts={shifts} filters={filters} />
            </div>
        </MainLayout>
    );
}


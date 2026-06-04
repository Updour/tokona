import { Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenShiftDialog } from './OpenShiftDialog';

export function ShiftStatusBanner() {
    return (
        <div className="rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700 p-6 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 mx-auto text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                Shift Belum Dibuka
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-400 max-w-md mx-auto">
                Anda harus membuka shift kasir terlebih dahulu sebelum bisa melakukan transaksi.
                Silakan hitung saldo awal di laci kas, lalu buka shift.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
                <OpenShiftDialog />
                <Button variant="outline" asChild>
                    <Link href="/shifts">Lihat Riwayat Shift</Link>
                </Button>
            </div>
        </div>
    );
}

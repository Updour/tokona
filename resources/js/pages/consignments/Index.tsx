import { Head, usePage } from '@inertiajs/react';
import { PackageOpen, Clock, Banknote, CalendarCheck } from 'lucide-react';
import { ConsignmentDetailDialog } from '@/features/consignments/components/ConsignmentDetailDialog';
import { ConsignmentReceiveDialog } from '@/features/consignments/components/ConsignmentReceiveDialog';
import { ConsignmentSettleDialog } from '@/features/consignments/components/ConsignmentSettleDialog';
import { ConsignmentTable } from '@/features/consignments/components/ConsignmentTable';
import MainLayout from '@/layouts/app/app-main-layout';
import { formatRupiah } from '@/lib/helpers/format';

export default function ConsignmentsIndex() {
    const { props } = usePage<any>();
    const stats = props.stats || {
        total_active_sessions: 0,
        total_active_value: 0,
        due_this_week: 0,
        sold_this_month: 0,
    };

    return (
        <MainLayout>
            <Head title="Barang Titipan (Konsinyasi)" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Barang Titipan (Konsinyasi)</h1>
                <p className="text-sm text-muted-foreground">
                    Kelola penerimaan, penyetoran, dan pantau masa jatuh tempo titipan dari supplier.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <PackageOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Sesi Titipan Aktif</p>
                        <h3 className="text-2xl font-black text-slate-800">{stats.total_active_sessions}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Banknote className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Nilai Titipan Aktif</p>
                        <h3 className="text-2xl font-black text-slate-800">{formatRupiah(stats.total_active_value)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <Clock className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Jatuh Tempo (7 Hari)</p>
                        <h3 className="text-2xl font-black text-rose-600">{stats.due_this_week} Sesi</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <CalendarCheck className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Setoran Bulan Ini</p>
                        <h3 className="text-2xl font-black text-amber-700">{formatRupiah(stats.sold_this_month)}</h3>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full">
                <ConsignmentTable />
            </div>

            <ConsignmentReceiveDialog />
            <ConsignmentSettleDialog />
            <ConsignmentDetailDialog />
        </MainLayout>
    );
}

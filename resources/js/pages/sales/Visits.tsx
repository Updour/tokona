import { formatDateTime } from '@/lib/helpers/format';
import { Head } from '@inertiajs/react';
import { CalendarRange, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { VisitFilters } from '@/features/sales/components/VisitFilters';
import { VisitsTable } from '@/features/sales/components/VisitsTable';
import MainLayout from '@/layouts/app/app-main-layout';

interface SalesVisitsProps {
    visits: {
        data: any[];
        total: number;
        from: number | null;
        to: number | null;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    salesPersons: any[];
    filters: any;
}

export default function SalesVisits({ visits, salesPersons = [], filters = {} }: SalesVisitsProps) {
    const handleExportCSV = () => {
        if (!visits?.data?.length) {
return;
}

        const rows = visits.data.map((item) => ({
            Salesperson: item.sales_person?.name ?? '-',
            Outlet: item.customer?.name ?? 'Toko Mitra',
            'Waktu Kunjungan': item.visited_at ? formatDateTime(item.visited_at) : '-',
            Status: item.status === 'ordered' ? 'Buat Order' : 'Cek Toko',
            Catatan: item.notes ?? '-',
            Latitude: item.latitude ?? '-',
            Longitude: item.longitude ?? '-',
            Alamat: item.address_text ?? '-',
        }));

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(','),
            ...rows.map((r) =>
                headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `riwayat_kunjungan_sales_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <MainLayout>
            <Head title="Riwayat Kunjungan Sales" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarRange className="h-6 w-6 text-indigo-600" />
                        Riwayat Kunjungan Sales
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pantau rute kunjungan harian personel sales ke outlet/toko pelanggan.
                    </p>
                </div>

                <Button
                    onClick={handleExportCSV}
                    disabled={!visits?.data?.length}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                    <FileSpreadsheet className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Filter Bar — sama layoutnya dengan halaman Sales & Produk */}
            <VisitFilters
                salesPersons={salesPersons}
                filters={filters}
                totalVisits={visits?.total ?? 0}
            />

            {/* Tabel Data */}
            <VisitsTable visits={visits?.data || []} />

            {/* Pagination */}
            <DataTablePagination data={visits as any} itemName="kunjungan" filters={filters} />
        </MainLayout>
    );
}

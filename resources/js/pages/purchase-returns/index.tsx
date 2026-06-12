import { Head, Link } from '@inertiajs/react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/app/app-main-layout';
import { ReturnTable } from '@/features/purchase-returns/components/ReturnTable';

export default function Index({ returns, filters }: any) {

    return (
        <MainLayout>
            <Head title="Retur Pembelian (Purchase Returns)" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                        <RotateCcw className="h-6 w-6" /> Retur Pembelian
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola data pengembalian barang ke Supplier dan lacak pengembalian dana.
                    </p>
                </div>
                <Button className="shrink-0 bg-red-600 hover:bg-red-700 text-white" asChild>
                    <Link href="/purchase-returns/create">
                        <Plus className="mr-2 h-4 w-4" /> Buat Retur Baru
                    </Link>
                </Button>
            </div>

            <ReturnTable returns={returns} filters={filters} />
        </MainLayout>
    );
}

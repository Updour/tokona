import { Head } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { ReturnForm } from '@/features/purchase-returns/components/ReturnForm';

export default function Create({ branches, suppliers, products }: any) {
    return (
        <MainLayout>
            <Head title="Buat Retur Pembelian" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                    <RotateCcw className="h-6 w-6" /> Buat Dokumen Retur
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Kembalikan barang rusak/cacat ke Pemasok. Stok barang di Inventory akan otomatis berkurang (OUT).
                </p>
            </div>

            <ReturnForm branches={branches} suppliers={suppliers} products={products} />
        </MainLayout>
    );
}

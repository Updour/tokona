import { Head } from '@inertiajs/react';
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm';
import MainLayout from '@/layouts/app/app-main-layout';

interface Props {
    branches: any[];
    products: any[];
    suppliers: any[];
}

export default function Create({ branches, products, suppliers }: Props) {
    return (
        <MainLayout>
            <Head title="Buat Pembelian" />

            <div className="flex flex-col gap-1 mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Buat Pembelian Baru</h1>
                <p className="text-sm text-muted-foreground">
                    Pilih cabang penerima, masukkan daftar produk, dan tentukan status tagihan.
                </p>
            </div>

            <PurchaseForm branches={branches} products={products} suppliers={suppliers} />
        </MainLayout>
    );
}

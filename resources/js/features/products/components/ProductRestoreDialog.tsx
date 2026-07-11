import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore } from '@/pages/products/stores/useProductStore';

export function ProductRestoreDialog() {
    const { isRestoreOpen, closeRestore, selectedProduct: product } = useProductStore();
    const [isRestoring, setIsRestoring] = useState(false);

    if (!product) return null;

    const handleRestore = () => {
        setIsRestoring(true);
        router.post(`/products/${product.id}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => closeRestore(),
            onFinish: () => setIsRestoring(false),
        });
    };

    return (
        <Dialog open={isRestoreOpen} onOpenChange={closeRestore}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pulihkan Produk</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin memulihkan produk{' '}
                        <strong className="text-foreground">"{product.name}"</strong>?
                        Produk akan kembali aktif dan muncul di sistem kasir.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-2">
                    <Button variant="outline" type="button" onClick={closeRestore} disabled={isRestoring}>
                        Batal
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        type="button"
                        disabled={isRestoring}
                        onClick={handleRestore}
                    >
                        {isRestoring ? 'Memulihkan...' : 'Ya, Pulihkan Produk'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

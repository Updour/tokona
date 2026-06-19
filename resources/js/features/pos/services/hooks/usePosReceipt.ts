import html2canvas from 'html2canvas';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';
import * as htmlToImage from 'html-to-image';
import { usePage } from '@inertiajs/react';

export function usePosReceipt() {
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('receipt-print-area');

        if (!printContent) {
return;
}

        const printWindow = window.open('', '_blank', 'width=350,height=600');

        if (!printWindow) {
            toast.error('Pop-up terblokir! Silakan aktifkan izin pop-up untuk mencetak struk.');

            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak Struk - ${lastTransaction?.invoice_number || 'POS'}</title>
                    <style>
                        @page { margin: 0; }
                        body {
                            font-family: 'Courier New', Courier, monospace;
                            width: 100%;
                            max-width: 280px;
                            margin: 0 auto;
                            padding: 10px;
                            box-sizing: border-box;
                            font-size: 11px;
                            line-height: 1.3;
                            color: #000;
                            background-color: #fff;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .border-t { border-top: 1px dashed #000; }
                        .py-1 { padding-top: 4px; padding-bottom: 4px; }
                        .py-2 { padding-top: 8px; padding-bottom: 8px; }
                        .flex-row { display: flex; justify-content: space-between; }
                        .gap-4 { gap: 16px; }
                        .font-black { font-weight: 900; }
                        .text-[10px] { font-size: 9px; color: #555; }
                        .text-[9px] { font-size: 8px; color: #777; }
                        .text-sm { font-size: 13px; }
                        .uppercase { text-transform: uppercase; }
                        .shrink-0 { flex-shrink: 0; }
                        .flex-1 { flex: 1; }
                        ::-webkit-scrollbar { display: none; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadReceiptImage = async () => {
        const element = document.getElementById('receipt-capture-area');

        if (!element) {
            toast.error('Gagal mendeteksi area struk untuk diambil gambar.');
            return;
        }

        toast.loading('Mempersiapkan gambar struk...', { id: 'dl-img' });

        try {
            // Use html-to-image natively to handle modern CSS like oklch()
            const dataUrl = await htmlToImage.toPng(element, {
                quality: 1.0,
                pixelRatio: 3,
                backgroundColor: '#f8fafc',
                skipFonts: true, // Fixes SecurityError in Vite dev server
                style: {
                    margin: '0',
                }
            });

            const link = document.createElement('a');
            const invoiceName = lastTransaction?.invoice_number ? lastTransaction.invoice_number.replace(/\//g, '_') : 'struk';
            link.download = `STRUK_${invoiceName}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Struk berhasil disimpan sebagai gambar PNG!', { id: 'dl-img' });
        } catch (error: any) {
            console.error('html-to-image error:', error);
            toast.error(`Gagal mengunduh gambar: ${error?.message || 'Error tidak diketahui'}`, { id: 'dl-img' });
        }
    };

    const handleSendWhatsAppReceipt = () => {
        if (!lastTransaction) {
            return;
        }

        const { auth, tenants } = usePage<any>().props;
        const currentTenant = tenants?.find((t: any) => t.id === auth?.user?.tenant_id);
        const storeName = currentTenant?.name ? currentTenant.name.toUpperCase() : 'TOKONA POS';

        const phone = lastTransaction.phone || '';
        const name = lastTransaction.customer || 'Pelanggan';
        let text = `*${storeName} - STRUK BELANJA*\n`;
        text += `=========================\n`;
        text += `Inv: ${lastTransaction.invoice_number}\n`;
        text += `Tanggal: ${formatDateTime(lastTransaction.date)}\n`;
        text += `Pelanggan: ${name}\n`;
        text += `=========================\n`;
        lastTransaction.items.forEach((it: any) => {
            text += `*${it.name}*\n  ${it.qty} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}\n`;
        });
        text += `=========================\n`;
        text += `Subtotal: ${formatRupiah(lastTransaction.subtotal)}\n`;

        if (lastTransaction.discount > 0) {
            text += `Diskon: -${formatRupiah(lastTransaction.discount)}\n`;
        }

        text += `PPN: ${formatRupiah(lastTransaction.tax)}\n`;

        if (lastTransaction.rounding_diff && lastTransaction.rounding_diff !== 0) {
            text += `Pembulatan Tunai: ${lastTransaction.rounding_diff > 0 ? '+' : ''}${formatRupiah(lastTransaction.rounding_diff)}\n`;
        }

        text += `*TOTAL: ${formatRupiah(lastTransaction.total)}*\n`;
        text += `=========================\n`;
        
        if (lastTransaction.earned_points > 0 || lastTransaction.current_points > 0) {
            if (lastTransaction.earned_points > 0) {
                text += `Poin Tambahan: +${lastTransaction.earned_points} Pts\n`;
            }
            text += `Total Poin Anda: ${lastTransaction.current_points || 0} Pts\n`;
            text += `=========================\n`;
        }
        
        text += `Terima kasih atas kunjungan Anda!\n`;

        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleReprint = (tx: any) => {
        setLastTransaction({
            invoice_number: tx.invoice_number,
            date: tx.created_at,
            items: tx.items.map((i: any) => ({
                name: i.product?.name ?? 'Barang Dihapus',
                qty: i.qty,
                price: parseFloat(i.price),
                subtotal: parseFloat(i.subtotal)
            })),
            subtotal: parseFloat(tx.subtotal),
            discount: parseFloat(tx.discount),
            tax: parseFloat(tx.tax),
            rounding_diff: parseFloat(tx.rounding_diff || 0),
            total: parseFloat(tx.total),
            paid_amount: parseFloat(tx.paid_amount),
            change_amount: parseFloat(tx.change_amount),
            payment_method: tx.payment_method,
            customer: tx.customer?.name ?? 'Pelanggan Umum',
            cashier: tx.creator?.name || '-'
        });
        setShowSuccessModal(true);
    };

    return {
        lastTransaction,
        setLastTransaction,
        showSuccessModal,
        setShowSuccessModal,
        handlePrintReceipt,
        handleDownloadReceiptImage,
        handleSendWhatsAppReceipt,
        handleReprint
    };
}

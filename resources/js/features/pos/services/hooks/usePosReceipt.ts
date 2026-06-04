import { useState } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/helpers/format';

export function usePosReceipt() {
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('receipt-print-area');
        if (!printContent) return;

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

    const handleDownloadReceiptImage = () => {
        const element = document.getElementById('receipt-print-area');
        if (!element) {
            toast.error('Gagal mendeteksi area struk untuk diambil gambar.');
            return;
        }

        const html2canvasFn = typeof html2canvas === 'function' ? html2canvas : (html2canvas as any).default;

        const originalMaxHeight = element.style.maxHeight;
        const originalOverflow = element.style.overflow;
        const originalClassName = element.className;

        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.className = "p-6 bg-white font-mono text-xs text-slate-900 space-y-4 w-[280px]";

        toast.promise(
            html2canvasFn(element, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then((canvas: any) => {
                element.style.maxHeight = originalMaxHeight;
                element.style.overflow = originalOverflow;
                element.className = originalClassName;

                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                const invoiceName = lastTransaction?.invoice_number ? lastTransaction.invoice_number.replace(/\//g, '_') : 'struk';
                link.download = `STRUK_${invoiceName}.png`;
                link.href = imgData;
                link.click();
            }).catch((err: any) => {
                element.style.maxHeight = originalMaxHeight;
                element.style.overflow = originalOverflow;
                element.className = originalClassName;
                throw err;
            }),
            {
                loading: 'Mempersiapkan gambar struk...',
                success: 'Struk berhasil disimpan sebagai gambar PNG!',
                error: 'Gagal mengunduh struk sebagai gambar.'
            }
        );
    };

    const handleSendWhatsAppReceipt = () => {
        if (!lastTransaction) return;

        const phone = lastTransaction.phone || '';
        const name = lastTransaction.customer || 'Pelanggan';
        let text = `*TOKONA POS - STRUK BELANJA*\n`;
        text += `=========================\n`;
        text += `Inv: ${lastTransaction.invoice_number}\n`;
        text += `Tanggal: ${new Date(lastTransaction.date).toLocaleString('id-ID')}\n`;
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

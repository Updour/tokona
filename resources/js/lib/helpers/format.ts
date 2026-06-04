import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format nominal angka menjadi Rupiah (Contoh: "Rp 1.500.000")
 */
export function formatRupiah(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
return 'Rp 0';
}

    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
return 'Rp 0';
}

    return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Format tanggal standar Indonesia (Contoh: "22 Mei 2026")
 */
export function formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) {
return '-';
}

    return format(new Date(dateString), 'd MMMM yyyy', {
        locale: id
    });
}

/**
 * Format tanggal standar Indonesia lengkap jam (Contoh: "22 Mei 2026 14:25")
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) {
return '-';
}

    return format(new Date(dateString), 'd MMMM yyyy HH:mm', {
        locale: id
    });
}

/**
 * Format tanggal kasual bahasa manusia (Contoh: "3 hari yang lalu")
 */
export function formatTimeAgo(dateString: string | Date | null | undefined): string {
    if (!dateString) {
return '-';
}

    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id
    });
}

/**
 * Mendapatkan string tanggal hari ini untuk form input type="date" (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

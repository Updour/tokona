import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal kasual bahasa manusia (Contoh: "3 hari yang lalu")
 */
export function formatTimeAgo(dateString: string | Date): string {
    if (!dateString) {
return '-';
}

    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id
    });
}

/**
 * Format tanggal standar Indonesia lengkap jam (Contoh: "22 Mei 2026 14:25")
 */
export function formatDateTime(dateString: string | Date): string {
    if (!dateString) {
return '-';
}

    return format(new Date(dateString), 'd MMMM yyyy HH:mm', {
        locale: id
    });
}

/**
 * Mendapatkan string tanggal hari ini untuk form input type="date" (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

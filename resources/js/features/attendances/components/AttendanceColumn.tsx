import type { ColumnDef } from '@tanstack/react-table';
import { MapPin } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/helpers/format';
import type { Attendance } from '../types';

const getStatusBadge = (status: Attendance['status']) => {
    const styles = {
        present: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
        late: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
        sick: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
        leave: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50',
        absent: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
    };

    const labels = {
        present: 'Hadir',
        late: 'Terlambat',
        sick: 'Sakit',
        leave: 'Cuti / Izin',
        absent: 'Alpha',
    };

    return (
        <Badge variant="outline" className={`${styles[status]} text-[10px] uppercase font-bold tracking-wider py-0.5`}>
            {labels[status]}
        </Badge>
    );
};

const renderLocationLink = (lat: number | null, lng: number | null, label: string) => {
    if (!lat || !lng) {
return <span className="text-xs text-muted-foreground">-</span>;
}

    return (
        <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
            <MapPin className="h-3 w-3" />
            {label}
        </a>
    );
};

const formatOnlyTime = (dateTimeString: string | null) => {
    if (!dateTimeString) {
return '-';
}

    try {
        const date = new Date(dateTimeString);

        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
        return '-';
    }
};

const calculateWorkingHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) {
return '-';
}

    try {
        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();
        const diffMs = end.getTime() - start.getTime();
        
        if (diffMs < 0) {
return '-';
}
        
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (!checkOut) {
            return <span className="text-blue-600 font-medium animate-pulse">{diffHrs}j {diffMins}m (Bekerja)</span>;
        }

        return <span className="text-slate-700 font-medium">{diffHrs}j {diffMins}m</span>;
    } catch {
        return '-';
    }
};

export const columns: ColumnDef<Attendance>[] = [
    {
        id: 'employee',
        header: 'Pegawai',
        accessorFn: (row) => row.user?.name,
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div>
                    <span className="font-semibold text-slate-800">{item.user?.name || 'Pegawai Terhapus'}</span>
                    <div className="text-[10px] text-muted-foreground">{item.user?.email}</div>
                </div>
            );
        }
    },
    {
        accessorKey: 'date',
        header: 'Tanggal',
        cell: ({ row }) => (
            <span className="font-mono text-xs text-slate-600">
                {formatDate(row.getValue('date'))}
            </span>
        )
    },
    {
        id: 'branch',
        header: 'Cabang',
        accessorFn: (row) => row.branch?.name,
        cell: ({ row }) => (
            <Badge variant="secondary" className="text-[10px]">
                {row.getValue('branch') || '-'}
            </Badge>
        )
    },
    {
        accessorKey: 'check_in_time',
        header: 'Masuk (Clock In)',
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold text-emerald-600">
                {formatOnlyTime(row.getValue('check_in_time'))}
            </span>
        )
    },
    {
        accessorKey: 'check_out_time',
        header: 'Pulang (Clock Out)',
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold text-amber-600">
                {formatOnlyTime(row.getValue('check_out_time'))}
            </span>
        )
    },
    {
        id: 'working_hours',
        header: 'Jam Kerja',
        cell: ({ row }) => (
            <div className="font-mono text-xs">
                {calculateWorkingHours(row.getValue('check_in_time'), row.getValue('check_out_time'))}
            </div>
        )
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status'))
    },
    {
        id: 'gps_location',
        header: 'Lokasi GPS',
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div className="space-y-1">
                    <div>{renderLocationLink(item.lat_in, item.lng_in, 'GPS Masuk')}</div>
                    <div>{renderLocationLink(item.lat_out, item.lng_out, 'GPS Pulang')}</div>
                </div>
            );
        }
    },
    {
        accessorKey: 'notes',
        header: 'Catatan',
        cell: ({ row }) => {
            const notes = row.getValue('notes') as string | null;

            return (
                <span className="text-xs text-slate-600 max-w-[200px] truncate block" title={notes || ''}>
                    {notes || '-'}
                </span>
            );
        }
    }
];

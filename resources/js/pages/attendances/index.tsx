import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, LogOut, CalendarRange, Clock, AlertTriangle, UserX, Calendar } from 'lucide-react';
import { useAttendance } from '@/features/attendances/services/useAttendance';
import { AttendanceFilters } from '@/features/attendances/components/AttendanceFilters';
import { AttendanceTable } from '@/features/attendances/components/AttendanceTable';
import { ClockInDialog } from '@/features/attendances/components/ClockInDialog';
import { ClockOutDialog } from '@/features/attendances/components/ClockOutDialog';
import { Attendance, AttendanceStats, AttendanceFilters as IFilters } from '@/features/attendances/types';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface AttendancesPageProps {
    attendances: {
        data: Attendance[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
        from: number;
        to: number;
    };
    stats: AttendanceStats;
    branches: Array<{ id: string; name: string }>;
    filters: IFilters;
}

export default function AttendancesIndex({ attendances, stats, branches, filters }: AttendancesPageProps) {
    const { formIn, formOut, handleClockIn, handleClockOut, store } = useAttendance();
    const { props } = usePage<any>();
    const isSuperAdmin = props.auth?.user?.is_super_admin || false;

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.branch_id) params.set('branch_id', filters.branch_id);
        if (filters.status) params.set('status', filters.status);
        if (filters.start_date) params.set('start_date', filters.start_date);
        if (filters.end_date) params.set('end_date', filters.end_date);
        
        window.location.href = `/attendances/export?${params.toString()}`;
    };

    const statCards = [
        { title: 'Hadir', value: stats.total_present, icon: Clock, color: 'text-emerald-600 border-l-emerald-500 bg-emerald-50/[0.01]' },
        { title: 'Terlambat', value: stats.total_late, icon: AlertTriangle, color: 'text-amber-600 border-l-amber-500 bg-amber-50/[0.01]' },
        { title: 'Sakit', value: stats.total_sick, icon: CalendarRange, color: 'text-blue-600 border-l-blue-500 bg-blue-50/[0.01]' },
        { title: 'Cuti / Izin', value: stats.total_leave, icon: Calendar, color: 'text-purple-600 border-l-purple-500 bg-purple-50/[0.01]' },
        { title: 'Alpha', value: stats.total_absent, icon: UserX, color: 'text-red-600 border-l-red-500 bg-red-50/[0.01]' },
    ];

    return (
        <MainLayout>
            <Head title="Absensi Pegawai" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Clock className="h-6 w-6 text-indigo-600" /> Absensi & Kehadiran Pegawai
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Lacak jam masuk, jam pulang, serta lokasi GPS presisi pegawai saat melakukan absensi harian.
                        </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button 
                            onClick={store.openClockIn} 
                            className="shadow-md bg-emerald-600 hover:bg-emerald-700 h-9 gap-1.5"
                        >
                            <LogIn className="h-4 w-4" /> Clock In
                        </Button>
                        <Button 
                            onClick={store.openClockOut} 
                            variant="outline" 
                            className="shadow-sm border-amber-200 text-amber-700 hover:bg-amber-50 h-9 gap-1.5"
                        >
                            <LogOut className="h-4 w-4" /> Clock Out
                        </Button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {statCards.map((card, idx) => (
                        <Card key={idx} className={`shadow-sm border-l-4 ${card.color}`}>
                            <CardHeader className="p-4 flex flex-row items-center justify-between pb-1 space-y-0">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">{card.title}</span>
                                <card.icon className={`h-4 w-4 ${card.color.split(' ')[0]}`} />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className={`text-2xl font-extrabold ${card.color.split(' ')[0]}`}>
                                    {card.value} <span className="text-xs font-normal text-muted-foreground">orang</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <AttendanceFilters 
                    branches={branches} 
                    filters={filters} 
                    totalResults={attendances.total} 
                    onExport={handleExport}
                />

                {/* Table */}
                <AttendanceTable data={attendances.data} />

                {/* Pagination */}
                <div className="pt-2">
                    <DataTablePagination data={attendances as any} itemName="absensi" filters={filters} />
                </div>
            </div>

            {/* Modals */}
            <ClockInDialog 
                isOpen={store.isClockInOpen} 
                onClose={store.closeClockIn} 
                form={formIn} 
                onSubmit={handleClockIn}
                branches={branches}
                isSuperAdmin={isSuperAdmin}
            />

            <ClockOutDialog 
                isOpen={store.isClockOutOpen} 
                onClose={store.closeClockOut} 
                form={formOut} 
                onSubmit={handleClockOut} 
            />
        </MainLayout>
    );
}

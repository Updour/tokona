import { Users, Clock, AlertTriangle, CalendarRange, UserX, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    attendanceReport: {
        present: number;
        late: number;
        sick: number;
        leave: number;
        absent: number;
    };
}

export function DashboardAttendanceSummary({ attendanceReport }: Props) {
    const total = attendanceReport.present + attendanceReport.late + attendanceReport.sick + attendanceReport.leave + attendanceReport.absent;

    return (
        <Card className="shadow-sm border-blue-100">
            <CardHeader className="pb-2 pt-3 border-b bg-blue-50/50">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" /> Kehadiran Hari Ini
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">Total: {total} Pegawai</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                {total === 0 ? (
                    <div className="flex items-center justify-center text-muted-foreground py-4">
                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                        <span className="text-sm ml-2">Belum ada data absensi hari ini.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Hadir</span>
                                <span className="text-xl font-extrabold text-emerald-700">{attendanceReport.present}</span>
                            </div>
                            <Clock className="h-6 w-6 text-emerald-200" />
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-amber-600 mb-0.5">Terlambat</span>
                                <span className="text-xl font-extrabold text-amber-700">{attendanceReport.late}</span>
                            </div>
                            <AlertTriangle className="h-6 w-6 text-amber-200" />
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-blue-600 mb-0.5">Sakit/Izin</span>
                                <span className="text-xl font-extrabold text-blue-700">{attendanceReport.sick + attendanceReport.leave}</span>
                            </div>
                            <CalendarRange className="h-6 w-6 text-blue-200" />
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-red-600 mb-0.5">Alpha</span>
                                <span className="text-xl font-extrabold text-red-700">{attendanceReport.absent}</span>
                            </div>
                            <UserX className="h-6 w-6 text-red-200" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

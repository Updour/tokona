import { formatDateTime } from '@/lib/helpers/format';
import { Calendar, Clock, Store, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useEmployeeStore } from '@/pages/employees/stores/useEmployeeStore';

export function EmployeeDetailSheet() {
    const { isDetailOpen, closeDetail, selectedEmployee: employee } = useEmployeeStore();

    if (!employee) return null;

    return (
        <Sheet open={isDetailOpen} onOpenChange={closeDetail}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-xl">{employee.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {employee.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        <span className="font-mono text-xs">{employee.email}</span>
                    </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 space-y-6">
                        <div className="grid gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal Registrasi</span>
                                <p className="font-medium">
                                    {employee.created_at ? new Date(employee.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Login Terakhir</span>
                                <p className="font-medium">
                                    {employee.last_login_at ? formatDateTime(employee.last_login_at) : 'Belum pernah login'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" /> Akses</span>
                                <p className="font-medium capitalize">{employee.roles?.[0]?.name || 'Belum diatur'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Store className="h-3.5 w-3.5" /> Cabang Penugasan</span>
                                <p className="font-medium">{employee.branch?.name || 'Semua Cabang (Global)'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

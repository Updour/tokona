import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Edit, Trash, Store, Shield, Eye, Calendar, Clock, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEmployeeStore } from '@/pages/employees/stores/useEmployeeStore';
import type {Employee} from '@/pages/employees/types';
import { destroy as employeesDestroy } from '@/routes/employees';
import * as React from 'react';

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 hover:bg-transparent"
                >
                    Nama Karyawan
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const employee = row.original;

            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{employee.name}</span>
                    <span className="text-muted-foreground text-xs">{employee.email}</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'phone',
        header: 'Nomor Telepon',
        cell: ({ row }) => {
            return <span className="font-medium text-sm text-foreground">{row.getValue('phone') || '-'}</span>;
        }
    },
    {
        id: 'role',
        header: 'Hak Akses / Peran',
        cell: ({ row }) => {
            const roles = row.original.roles || [];
            const roleName = roles[0]?.name || 'Belum Diatur';
            
            let customStyle = "bg-muted text-muted-foreground border-transparent";
            
            switch (roleName.toLowerCase()) {
                case 'super-admin':
                    customStyle = "bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-sm";
                    break;
                case 'owner':
                    customStyle = "bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm";
                    break;
                case 'admin':
                    customStyle = "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm";
                    break;
                case 'cashier':
                    customStyle = "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm";
                    break;
            }
            
            return (
                <Badge className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${customStyle}`}>
                    <Shield className="mr-1 h-3 w-3" />
                    {roleName === 'super-admin' ? 'Super Admin' : roleName}
                </Badge>
            );
        }
    },
    {
        id: 'branch',
        header: 'Penugasan',
        cell: ({ row }) => {
            const branch = row.original.branch;
            const tenant = row.original.tenant;

            return (
                <div className="flex flex-col gap-0.5">
                    {tenant && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <Store className="h-3 w-3" />
                            {tenant.name}
                        </div>
                    )}
                    {branch ? (
                        <div className="flex items-center gap-1.5 text-foreground mt-0.5">
                            {!tenant && <Store className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-medium text-sm">{branch.name}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs italic mt-0.5">Semua Cabang (Global)</span>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal Daftar',
        cell: ({ row }) => {
            const dateStr = row.getValue('created_at') as string;

            return (
                <span className="text-muted-foreground text-sm">
                    {dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                </span>
            );
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;

            return (
                <Badge 
                    variant={status === 'active' ? 'default' : 'secondary'}
                    className={
                        status === 'active' 
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent rounded-full px-2.5' 
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-transparent rounded-full px-2.5'
                    }
                >
                    {status === 'active' ? 'Aktif' : 'Nonaktif'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const employee = row.original;
            const openForm = useEmployeeStore((state) => state.openForm);
            
            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
            const [isDeleting, setIsDeleting] = React.useState(false);
            const [isDetailOpen, setIsDetailOpen] = React.useState(false);

            const handleDelete = () => {
                setIsDeleting(true);
                router.delete(employeesDestroy(employee.id).url, {
                    preserveScroll: true,
                    onSuccess: () => setIsDeleteDialogOpen(false),
                    onFinish: () => setIsDeleting(false),
                });
            };

            return (
                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        {/* Detail button */}
                        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </SheetTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Detail Karyawan</TooltipContent>
                            </Tooltip>

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
                                                    {employee.last_login_at ? new Date(employee.last_login_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Belum pernah login'}
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

                        {/* Edit button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                    onClick={() => openForm(employee)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Karyawan</TooltipContent>
                        </Tooltip>

                        {/* Delete with confirmation dialog */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Hapus Karyawan</TooltipContent>
                            </Tooltip>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Hapus Karyawan</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus karyawan{' '}
                                        <strong className="text-foreground">"{employee.name}"</strong>?
                                        Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button">
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                    >
                                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Karyawan'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </TooltipProvider>
            );
        },
    },
];

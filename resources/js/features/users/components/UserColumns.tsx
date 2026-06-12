import { formatDateTime } from '@/lib/helpers/format';
import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Edit, Trash, Store, Shield, Eye, Calendar, Clock, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserStore } from '@/pages/users/stores/useUserStore';
import type {User} from '@/pages/users/types';
import * as React from 'react';

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 hover:bg-transparent"
                >
                    Nama Akun
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{user.name}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
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
            const user = row.original;
            const { openForm, openDetail, openDelete } = useUserStore();

            return (
                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        {/* Detail button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                    onClick={() => openDetail(user)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Detail Akun</TooltipContent>
                        </Tooltip>

                        {/* Edit button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                    onClick={() => openForm(user)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Akun</TooltipContent>
                        </Tooltip>

                        {/* Delete button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    onClick={() => openDelete(user)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hapus Akun</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            );
        },
    },
];

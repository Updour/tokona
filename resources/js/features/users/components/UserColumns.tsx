import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown, Edit, Trash, Store, Shield } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/pages/users/stores/useUserStore';
import { type User } from '@/pages/users/types';
import { router } from '@inertiajs/react';
import { destroy as usersDestroy } from '@/routes/users';

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
                    Nama Karyawan
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
            const openForm = useUserStore((state) => state.openForm);

            const handleDelete = () => {
                if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${user.name}"?`)) {
                    router.delete(usersDestroy(user.id).url);
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                            Salin ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openForm(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                            <Trash className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

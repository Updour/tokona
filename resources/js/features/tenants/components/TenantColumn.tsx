// @/features/tenants/components/TenantColumn.tsx

import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Edit, Trash } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTenantStore  } from '@/pages/tenants/stores/useTenantStore';
import type {Tenant} from '@/pages/tenants/stores/useTenantStore';
import { destroy as tenantsDestroy } from '@/routes/tenants';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'active': return 'default';
        case 'suspended': return 'destructive';
        case 'trial': return 'secondary';
        default: return 'outline';
    }
};

const getPlanVariant = (plan: string) => {
    switch (plan) {
        case 'enterprise': return 'default';
        case 'pro': return 'secondary';
        default: return 'outline';
    }
};

export const columns: ColumnDef<Tenant>[] = [
    {
        id: 'rowNumber',
        header: '#',
        cell: ({ row }) => (
            <span className="text-muted-foreground font-medium text-sm pl-2">
                {row.index + 1}
            </span>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                    <AvatarImage src={row.original.logo_url} alt={row.original.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {row.original.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'slug',
        header: 'Slug/Domain',
        cell: ({ row }) => (
            <span className="text-muted-foreground font-mono text-sm">/{row.getValue('slug')}</span>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.getValue('email') || <span className="text-muted-foreground">—</span>,
    },
    {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => {
            const plan = row.getValue('plan') as string;

            return (
                <Badge variant={getPlanVariant(plan)} className="capitalize">
                    {plan}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;

            return (
                <Badge variant={getStatusVariant(status)} className="capitalize">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'expires_at',
        header: 'Masa Aktif',
        cell: ({ row }) => {
            const expiresAt = row.original.expires_at;

            if (!expiresAt) {
return <span className="text-muted-foreground">—</span>;
}

            const expiryDate = new Date(expiresAt);
            const isExpired = expiryDate < new Date();

            return (
                <div className="flex flex-col gap-0.5">
                    <span className={`font-semibold text-sm ${isExpired ? 'text-destructive' : 'text-slate-700'}`}>
                        {expiryDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {isExpired ? (
                        <span className="text-[10px] text-destructive font-medium flex items-center gap-1"> Kedaluwarsa</span>
                    ) : (
                        <span className="text-[10px] text-muted-foreground">
                            s.d. {expiryDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const tenant = row.original;
            const openForm = useTenantStore((state) => state.openForm);
            const openView = useTenantStore((state) => state.openView);

            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
            const [isDeleting, setIsDeleting] = React.useState(false);

            const handleDelete = () => {
                setIsDeleting(true);
                router.delete(tenantsDestroy(tenant.id).url, {
                    onSuccess: () => setIsDeleteDialogOpen(false),
                    onFinish: () => setIsDeleting(false),
                });
            };

            return (
                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        {/* View button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                    onClick={() => openView(tenant)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail Tenant</TooltipContent>
                        </Tooltip>

                        {/* Edit button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                    onClick={() => openForm(tenant)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Tenant</TooltipContent>
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
                                <TooltipContent>Delete Tenant</TooltipContent>
                            </Tooltip>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Delete Tenant</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete tenant{' '}
                                        <strong className="text-foreground">"{tenant.name}"</strong>?
                                        This action cannot be undone and all associated data will be permanently removed.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete Tenant'}
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

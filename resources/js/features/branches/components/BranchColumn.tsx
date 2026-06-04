import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Edit, Trash, Check, X } from 'lucide-react';
import * as React from 'react';
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
import { useBranchStore  } from '@/pages/branches/stores/useBranchStore';
import type {Branch} from '@/pages/branches/stores/useBranchStore';
import { destroy as branchesDestroy } from '@/routes/branches';

export const columns: ColumnDef<Branch>[] = [
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
        accessorKey: 'code',
        header: 'Kode',
        cell: ({ row }) => (
            <span className="font-mono text-sm uppercase">{row.getValue('code')}</span>
        ),
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Nama
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'phone',
        header: 'No. Telepon',
        cell: ({ row }) => row.getValue('phone') || <span className="text-muted-foreground">—</span>,
    },
    {
        accessorKey: 'is_main',
        header: 'Tipe',
        cell: ({ row }) => {
            const isMain = row.getValue('is_main') as boolean;

            return (
                <Badge variant={isMain ? 'default' : 'secondary'} className="capitalize">
                    {isMain ? 'Cabang Utama' : 'Cabang Pembantu'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const branch = row.original;
            const openForm = useBranchStore((state) => state.openForm);
            const openView = useBranchStore((state) => state.openView);

            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
            const [isDeleting, setIsDeleting] = React.useState(false);

            const handleDelete = () => {
                setIsDeleting(true);
                router.delete(branchesDestroy(branch.id).url, {
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
                                    onClick={() => openView(branch)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail Cabang</TooltipContent>
                        </Tooltip>

                        {/* Edit button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                    onClick={() => openForm(branch)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Cabang</TooltipContent>
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
                                <TooltipContent>Hapus Cabang</TooltipContent>
                            </Tooltip>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Hapus Cabang</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus cabang{' '}
                                        <strong className="text-foreground">"{branch.name}"</strong>?
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
                                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Cabang'}
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

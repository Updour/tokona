import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Trash2, UserCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function CashAdvanceTable({ cashAdvances }: { cashAdvances: any }) {
    const deleteKasbon = (id: string) => {
        if (confirm('Yakin ingin membatalkan dan menghapus kasbon ini? Uang di kasir akan disesuaikan kembali.')) {
            router.delete(`/hris/cash-advances/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <Table>
                <TableHeader className="bg-neutral-50 dark:bg-neutral-800/50">
                    <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nominal Kasbon</TableHead>
                        <TableHead>Sisa Hutang</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cashAdvances.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Tidak ada data kasbon.
                            </TableCell>
                        </TableRow>
                    ) : (
                        cashAdvances.data.map((ca: any) => (
                            <TableRow key={ca.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-8 w-8 text-neutral-400" />
                                        <div className="flex flex-col">
                                            <span>{ca.user?.name}</span>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{ca.reason}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(ca.date), 'dd MMM yyyy', { locale: idLocale })}
                                </TableCell>
                                <TableCell className="font-semibold text-red-600 dark:text-red-400">
                                    {formatCurrency(ca.amount)}
                                </TableCell>
                                <TableCell className="font-bold">
                                    {formatCurrency(ca.remaining_amount)}
                                </TableCell>
                                <TableCell>
                                    {ca.status === 'paid' ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400">
                                            Lunas (Dipotong Gaji)
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400">
                                            Belum Lunas
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {ca.status === 'approved' && ca.amount === ca.remaining_amount && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteKasbon(ca.id)}
                                            title="Batalkan Kasbon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

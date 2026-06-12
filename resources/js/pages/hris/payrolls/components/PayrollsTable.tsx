import { formatRupiah } from '@/lib/helpers/format';
import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePayrollStore } from '../stores/usePayrollStore';

interface Props {
    payrolls: any[];
    formatDate: (dateString: string) => string;
}

export default function PayrollsTable({ payrolls, formatDate }: Props) {
    const { openConfirmPay } = usePayrollStore();
    
    if (payrolls.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed mt-4">
                Belum ada slip gaji yang tercatat untuk filter ini.
            </div>
        );
    }

    return (
        <div className="rounded-md border mt-4 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-4 py-3 whitespace-nowrap">ID & Karyawan</th>
                            <th className="px-4 py-3 whitespace-nowrap">Periode</th>
                            <th className="px-4 py-3 text-right whitespace-nowrap">Gaji Pokok</th>
                            <th className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500 whitespace-nowrap">Tunjangan (+)</th>
                            <th className="px-4 py-3 text-right text-destructive whitespace-nowrap">Potongan (-)</th>
                            <th className="px-4 py-3 text-right text-primary whitespace-nowrap">Take Home Pay</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                            <th className="px-4 py-3 text-right whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payrolls.map((payroll) => (
                            <tr key={payroll.id} className="bg-card hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                                            {payroll.user?.avatar ? (
                                                <img src={`/storage/${payroll.user.avatar}`} alt={payroll.user?.name || 'User'} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-semibold text-xs text-muted-foreground">
                                                    {payroll.user?.name?.charAt(0) || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground line-clamp-1">{payroll.user?.name || 'Karyawan Tidak Diketahui'}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground">#{payroll.id.substring(0, 8)}</span>
                                                {payroll.user?.nip && (
                                                    <>
                                                        <span className="text-[10px] text-muted-foreground">&bull;</span>
                                                        <span className="text-[10px] text-muted-foreground">{payroll.user.nip}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {formatDate(payroll.period_start)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    {formatRupiah(payroll.basic_salary)}
                                </td>
                                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500 whitespace-nowrap">
                                    {formatRupiah(payroll.total_allowance)}
                                </td>
                                <td className="px-4 py-3 text-right text-destructive whitespace-nowrap">
                                    - {formatRupiah(payroll.total_deduction)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-primary whitespace-nowrap bg-primary/5">
                                    {formatRupiah(payroll.net_salary)}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                    {payroll.status === 'paid' ? (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1 font-medium">
                                            <CheckCircle className="h-3 w-3" /> Lunas
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 gap-1 font-medium">
                                            <Clock className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                        {payroll.status === 'draft' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                                onClick={() => openConfirmPay(payroll.id)}
                                            >
                                                Bayar
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 text-xs"
                                            onClick={() => window.open(`/hris/payrolls/${payroll.id}/print`, '_blank')}
                                        >
                                            Cetak
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

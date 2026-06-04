import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, TrendingDown, Banknote, CreditCard, Receipt, AlertTriangle } from 'lucide-react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDateTime } from '@/lib/helpers/format';
import type { ShiftSummary } from '@/features/shifts/types';

export default function ShiftShowPage(props: ShiftSummary) {
    const { shift, total_sales, cash_sales, non_cash_sales, tx_count, expected_balance, difference } = props;
    const hasDifference = difference !== null && difference !== 0;
    const isPositive = (difference ?? 0) >= 0;

    return (
        <MainLayout>
            <Head title={`Shift — ${shift.user?.name}`} />
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/shifts"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Ringkasan Shift</h1>
                        <p className="text-sm text-muted-foreground">
                            {shift.user?.name} &mdash; {shift.branch?.name} &mdash;{' '}
                            <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>
                                {shift.status === 'open' ? 'Aktif' : 'Ditutup'}
                            </Badge>
                        </p>
                    </div>
                </div>

                {/* Info Waktu */}
                <Card>
                    <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Dibuka:</span>
                            <p className="font-medium">{formatDateTime(shift.opened_at)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Ditutup:</span>
                            <p className="font-medium">{shift.closed_at ? formatDateTime(shift.closed_at) : 'Masih aktif'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <Receipt className="h-4 w-4" /> Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-2xl font-bold">{tx_count}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> Total Penjualan
                            </CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-2xl font-bold">{formatRupiah(total_sales)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <Banknote className="h-4 w-4" /> Tunai
                            </CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-2xl font-bold">{formatRupiah(cash_sales)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Non-Tunai
                            </CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-2xl font-bold">{formatRupiah(non_cash_sales)}</p></CardContent>
                    </Card>
                </div>

                {/* Rekonsiliasi */}
                {shift.status === 'closed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Rekonsiliasi Kas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Saldo Awal</span>
                                <span className="font-medium">{formatRupiah(shift.opening_balance)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>+ Penjualan Tunai</span>
                                <span className="font-medium text-green-600">{formatRupiah(cash_sales)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-semibold">
                                <span>Saldo Seharusnya</span>
                                <span>{formatRupiah(expected_balance)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Saldo Aktual</span>
                                <span>{formatRupiah(shift.closing_balance ?? 0)}</span>
                            </div>
                            {hasDifference && (
                                <div className={`flex justify-between font-bold rounded-lg p-3 ${isPositive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                    <span className="flex items-center gap-2">
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                        Selisih
                                    </span>
                                    <span>{formatRupiah(difference ?? 0)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shift.notes && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Catatan</CardTitle></CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">{shift.notes}</p></CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

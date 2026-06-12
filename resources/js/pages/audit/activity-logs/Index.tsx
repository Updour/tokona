import { Head, router } from '@inertiajs/react';
import { Activity, Search, Filter, RefreshCw, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { formatDate } from '@/lib/helpers/format';
import MainLayout from '@/layouts/app/app-main-layout';
import { useActivityLogStore } from './stores/useActivityLogStore';
import { useRestoreStore } from './stores/useRestoreStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ActivityLogIndex({ logs, filters, users, branches, isSuperAdmin }: any) {
    const { isFilterOpen, setFilterOpen } = useActivityLogStore();
    const { restoreProduct, restoreCustomer, isRestoring } = useRestoreStore();
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');
    const [userFilter, setUserFilter] = useState(filters.user_id || '');

    const [selectedLog, setSelectedLog] = useState<any>(null);

    const isRestoreable = selectedLog?.action === 'Hapus Data Penting' &&
        (selectedLog?.subject_type?.includes('Products') || selectedLog?.subject_type?.includes('Customer')) &&
        !!selectedLog?.subject &&
        selectedLog?.subject?.deleted_at !== null;

    const isAlreadyRestored = selectedLog?.action === 'Hapus Data Penting' &&
        (selectedLog?.subject_type?.includes('Products') || selectedLog?.subject_type?.includes('Customer')) &&
        !!selectedLog?.subject &&
        selectedLog?.subject?.deleted_at === null;

    const isPermanentlyDeleted = selectedLog?.action === 'Hapus Data Penting' &&
        (selectedLog?.subject_type?.includes('Products') || selectedLog?.subject_type?.includes('Customer')) &&
        !selectedLog?.subject;

    const handleRestoreAction = async () => {
        if (!selectedLog) return;
        if (selectedLog.subject_type?.includes('Products')) {
            await restoreProduct(selectedLog.subject_id);
        } else if (selectedLog.subject_type?.includes('Customer')) {
            await restoreCustomer(selectedLog.subject_id);
        }
        setSelectedLog(null);
    };

    const handleSearch = () => {
        router.get('/audit/activity-logs', {
            search,
            action: actionFilter,
            user_id: userFilter
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setActionFilter('');
        setUserFilter('');
        router.get('/audit/activity-logs', {}, { preserveState: true });
    };

    const getActionBadge = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('login')) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Login</Badge>;
        if (a.includes('logout')) return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">Logout</Badge>;
        if (a.includes('hapus')) return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Delete</Badge>;
        if (a.includes('pos') || a.includes('transaksi')) return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Transaction</Badge>;
        return <Badge variant="outline">{action}</Badge>;
    };

    return (
        <MainLayout>
            <Head title="Activity Logs - Audit Trail" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-600" /> Audit Trail (Aktivitas Pengguna)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pantau seluruh aktivitas penting yang dilakukan oleh kasir dan staf untuk mencegah kecurangan.
                    </p>
                </div>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <div className="flex flex-1 gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari aktivitas..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-xs"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setFilterOpen(!isFilterOpen)} className="h-9 gap-1 text-xs">
                                    <Filter className="h-3.5 w-3.5" /> Filter
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-xs text-muted-foreground">
                                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                                </Button>
                            </div>
                        </div>

                        {isFilterOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border text-sm">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Aksi / Event</label>
                                    <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); }}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Semua Aksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Aksi</SelectItem>
                                            <SelectItem value="login">Login / Logout</SelectItem>
                                            <SelectItem value="Hapus">Penghapusan Data</SelectItem>
                                            <SelectItem value="Transaksi">Transaksi (PO/POS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Pengguna (User)</label>
                                    <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); }}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Semua User" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua User</SelectItem>
                                            {users?.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button size="sm" onClick={handleSearch} className="h-9 w-full text-xs">
                                        Terapkan Filter
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold text-slate-700 text-xs">Waktu</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">Pengguna</TableHead>
                                        {isSuperAdmin && <TableHead className="font-bold text-slate-700 text-xs">Cabang</TableHead>}
                                        <TableHead className="font-bold text-slate-700 text-xs">Aksi</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">Deskripsi</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">IP Address</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700 text-xs pr-4">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!logs?.data?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={isSuperAdmin ? 7 : 6} className="h-24 text-center text-muted-foreground text-xs">
                                                Belum ada catatan aktivitas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                                <TableCell className="text-xs">
                                                    <span className="font-medium">{formatDate(log.created_at)}</span>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(log.created_at).toLocaleTimeString('id-ID')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-800">
                                                    {log.user?.name || 'System / Guest'}
                                                </TableCell>
                                                {isSuperAdmin && (
                                                    <TableCell className="text-xs text-slate-600">
                                                        {log.branch?.name || '-'}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-xs">
                                                    {getActionBadge(log.action)}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 max-w-[250px] truncate">
                                                    {log.description}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-mono text-slate-500">
                                                    {log.ip_address}
                                                </TableCell>
                                                <TableCell className="text-right pr-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setSelectedLog(log)}
                                                        disabled={!log.properties}
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <DataTablePagination
                            data={logs as any}
                            itemName="aktivitas"
                            filters={filters}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Detail */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            Detail Aktivitas
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Data JSON spesifik yang disimpan saat aktivitas ini terjadi.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Aksi:</span>
                                    <span className="font-semibold">{selectedLog.action}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">User:</span>
                                    <span className="font-semibold">{selectedLog.user?.name || 'Unknown'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-1">Keterangan:</span>
                                    <span className="text-slate-800">{selectedLog.description}</span>
                                </div>
                            </div>

                            <div className="rounded-md bg-slate-950 p-4 overflow-x-auto">
                                <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                                    {JSON.stringify(selectedLog.properties, null, 2)}
                                </pre>
                            </div>

                            {isRestoreable && (
                                <div className="flex justify-end pt-3 border-t">
                                    <Button
                                        onClick={handleRestoreAction}
                                        disabled={isRestoring}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-2"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                                        Pulihkan Data (Restore)
                                    </Button>
                                </div>
                            )}

                            {isAlreadyRestored && (
                                <div className="flex justify-end pt-3 border-t">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs px-3 py-2 rounded-md font-medium flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Data ini telah dipulihkan dan aktif kembali
                                    </div>
                                </div>
                            )}

                            {isPermanentlyDeleted && (
                                <div className="flex justify-end pt-3 border-t">
                                    <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs px-3 py-2 rounded-md font-medium flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4" />
                                        Data ini telah dihapus permanen dari sistem
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

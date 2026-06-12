import { Head, router } from '@inertiajs/react';
import { ShieldAlert, Search, Filter, RefreshCw, Terminal, EyeOff, FileWarning } from 'lucide-react';
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
import { useSystemLogStore } from './stores/useSystemLogStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function SystemLogIndex({ logs, filters }: any) {
    const { isFilterOpen, setFilterOpen } = useSystemLogStore();
    const [search, setSearch] = useState(filters.search || '');
    const [levelFilter, setLevelFilter] = useState(filters.level || '');
    
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const handleSearch = () => {
        router.get('/audit/system-logs', { 
            search, 
            level: levelFilter 
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setLevelFilter('');
        router.get('/audit/system-logs', {}, { preserveState: true });
    };

    const getLevelBadge = (level: string) => {
        const l = level.toLowerCase();
        if (l === 'error') return <Badge className="bg-red-500 hover:bg-red-600 border-0">ERROR</Badge>;
        if (l === 'warning') return <Badge className="bg-amber-500 hover:bg-amber-600 border-0">WARNING</Badge>;
        return <Badge className="bg-blue-500 hover:bg-blue-600 border-0">{level.toUpperCase()}</Badge>;
    };

    return (
        <MainLayout>
            <Head title="System Logs - Error Tracker" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6" /> System Error Tracker
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Khusus Super Admin: Pantau error database, HTTP 500, dan anomali server secara real-time.
                    </p>
                </div>

                <Card className="border-red-100 shadow-sm border-t-4 border-t-red-500">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <div className="flex flex-1 gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari pesan error atau class exception..."
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border text-sm">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Level Error</label>
                                    <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); }}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Semua Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Level</SelectItem>
                                            <SelectItem value="error">ERROR</SelectItem>
                                            <SelectItem value="warning">WARNING</SelectItem>
                                            <SelectItem value="info">INFO</SelectItem>
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
                                        <TableHead className="font-bold text-slate-700 text-xs">Level</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">Exception Class</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">URL Endpoint</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs">Tenant / Toko</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700 text-xs pr-4">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!logs?.data?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-emerald-600 text-sm font-medium">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <ShieldAlert className="h-8 w-8 text-emerald-500 opacity-50" />
                                                    Sistem berjalan dengan stabil. Tidak ada error log.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                                <TableCell className="text-xs">
                                                    <span className="font-medium text-slate-800">{formatDate(log.created_at)}</span>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(log.created_at).toLocaleTimeString('id-ID')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {getLevelBadge(log.level)}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-red-600 max-w-[200px] truncate">
                                                    {log.exception_class}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-mono text-slate-500 max-w-[200px] truncate">
                                                    {log.url}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-700">
                                                    {log.tenant?.name || 'Sistem Core'}
                                                </TableCell>
                                                <TableCell className="text-right pr-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 hover:bg-slate-100"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        <Terminal className="h-4 w-4 text-slate-600" />
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
                            itemName="error log" 
                            filters={filters} 
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Stack Trace */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                            <FileWarning className="w-5 h-5" />
                            Detail Error Stack Trace
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Analisis mendalam mengapa sistem mengalami kegagalan proses.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4 py-2">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <h4 className="text-xs font-bold text-red-800 mb-1">Pesan Error Asli:</h4>
                                <p className="text-xs text-red-600 font-mono whitespace-pre-wrap">
                                    {selectedLog.message}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-1">File Lokasi Error:</span>
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded break-all">{selectedLog.file} : <span className="font-bold text-red-600">Line {selectedLog.line}</span></span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Exception Class:</span>
                                    <span className="font-mono font-bold">{selectedLog.exception_class}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">URL / Endpoint:</span>
                                    <span className="font-mono text-blue-600 break-all">{selectedLog.url}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">IP Address & User ID:</span>
                                    <span className="font-mono">{selectedLog.ip_address} | User: {selectedLog.user_id || 'Guest'}</span>
                                </div>
                            </div>
                            
                            <div className="rounded-md bg-slate-950 p-4 overflow-y-auto max-h-[300px]">
                                <pre className="text-[10px] text-green-400 font-mono leading-relaxed whitespace-pre-wrap break-all">
                                    {JSON.stringify(selectedLog.trace, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

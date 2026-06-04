import { useState, useEffect } from 'react';
import { 
    Users, UserPlus, Phone, Mail, Award, CheckCircle2, 
    TrendingUp, Building, Package, Pencil, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SalesPerson } from '../types';

// Subcomponents
import { SalesFilters } from './SalesFilters';
import { SalesAddDialog } from './SalesAddDialog';
import { SalesEditDialog } from './SalesEditDialog';
import { SalesDeleteDialog } from './SalesDeleteDialog';
import { SalesStockDialog } from './SalesStockDialog';
import { SalesPerformanceDialog } from './SalesPerformanceDialog';

interface SalesTableProps {
    sales: {
        data: SalesPerson[];
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links?: any[];
    };
    branches: any[];
    products: any[];
    filters?: any;
}

export function SalesTable({ sales, branches = [], products = [], filters = {} }: SalesTableProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);
    const [performanceOpen, setPerformanceOpen] = useState(false);
    const [selectedSales, setSelectedSales] = useState<SalesPerson | null>(null);

    // Keep selected sales synchronized with parent props on reload
    useEffect(() => {
        if (selectedSales) {
            const latest = sales?.data?.find(s => s.id === selectedSales.id);
            if (latest) {
                setSelectedSales(latest);
            }
        }
    }, [sales]);

    const openStockManager = (item: SalesPerson) => {
        setSelectedSales(item);
        setStockOpen(true);
    };

    const openPerformanceManager = (item: SalesPerson) => {
        setSelectedSales(item);
        setPerformanceOpen(true);
    };

    const openEditManager = (item: SalesPerson) => {
        setSelectedSales(item);
        setEditOpen(true);
    };

    const openDeleteConfirmation = (item: SalesPerson) => {
        setSelectedSales(item);
        setDeleteOpen(true);
    };

    return (
        <div className="flex-1 bg-background rounded-lg border shadow-sm p-4 w-full mt-6 space-y-4">
            
            {/* Top Toolbar: Search, Filters & Add Sales Action */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                    <SalesFilters 
                        branches={branches} 
                        filters={filters} 
                        totalSales={sales?.total ?? 0} 
                    />
                </div>
                <div className="shrink-0 flex items-center pt-1">
                    <Button 
                        onClick={() => setAddOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs gap-1.5 h-9 shadow-sm"
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah Sales
                    </Button>
                </div>
            </div>

            {/* Main Data Table */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[180px] text-xs font-black text-slate-700 py-3">Nama Sales</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 py-3">Cabang Tugas</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 py-3">Skema Komisi</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 py-3">Kontak</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 text-center py-3">Kunjungan</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 text-center py-3">Pesanan</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 text-center py-3">Status</TableHead>
                            <TableHead className="text-xs font-black text-slate-700 text-right py-3">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales?.data?.length > 0 ? (
                            sales.data.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="font-bold text-slate-800 flex items-center gap-2">
                                        <div className="h-8 w-8 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center font-black text-xs shrink-0 border border-indigo-100">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">{item.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {item.id.substring(0, 8)}...</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-xs text-slate-700 font-bold">
                                            <Building className="h-3.5 w-3.5 text-indigo-600" />
                                            {item.branch?.name ?? '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-750 font-black text-[10px] border border-indigo-100 px-2 py-0.5">
                                            <Award className="h-3 w-3 mr-1" />
                                            {item.commission_type === 'percent' ? `${item.commission_value}%` : `Rp ${Number(item.commission_value).toLocaleString('id-ID')}`}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <div className="text-xs text-slate-655 flex items-center gap-1.5 font-semibold">
                                                <Phone className="h-3 w-3 text-slate-400" /> {item.phone ?? '-'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
                                                <Mail className="h-3 w-3 text-slate-400" /> {item.email ?? '-'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-black text-slate-700">{item.visits_count} kali</TableCell>
                                    <TableCell className="text-center font-black text-emerald-700">{item.orders_count} transaksi</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={`font-extrabold text-[10px] border-0 px-2 py-0.5 ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> {item.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => openStockManager(item)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs font-black border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white gap-1"
                                                        >
                                                            <Package className="h-3.5 w-3.5" /> Stok Canvas
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Kelola Stok Canvas Sales</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => openPerformanceManager(item)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs font-black border-slate-200 hover:bg-slate-100 bg-white"
                                                        >
                                                            <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-600 animate-pulse" /> Performa
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Lihat Performa Sales</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => openEditManager(item)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Sales</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => openDeleteConfirmation(item)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus Sales</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-slate-500 py-12 font-semibold">
                                    Tidak ada personel sales representative lapangan yang cocok dengan filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Standard */}
            <DataTablePagination data={sales as any} itemName="personel sales" filters={filters} />

            {/* Unified & Modular Subcomponent Modals */}
            <SalesAddDialog 
                open={addOpen} 
                onOpenChange={setAddOpen} 
                branches={branches} 
            />

            <SalesEditDialog 
                open={editOpen} 
                onOpenChange={setEditOpen} 
                selectedSales={selectedSales} 
                branches={branches} 
            />

            <SalesDeleteDialog 
                open={deleteOpen} 
                onOpenChange={setDeleteOpen} 
                selectedSales={selectedSales} 
            />

            <SalesStockDialog 
                open={stockOpen} 
                onOpenChange={setStockOpen} 
                selectedSales={selectedSales} 
                products={products} 
            />

            <SalesPerformanceDialog 
                open={performanceOpen} 
                onOpenChange={setPerformanceOpen} 
                selectedSales={selectedSales} 
            />
        </div>
    );
}

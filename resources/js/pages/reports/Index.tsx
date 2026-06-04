import { Head, router } from '@inertiajs/react';
import { 
    PieChart, TrendingUp, Package2, 
    Calendar, Sparkles, ShoppingBag, Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/layouts/app/app-main-layout';
import ProductPerformanceReport from '@/features/reports/components/ProductPerformanceReport';
import SalesReport from '@/features/reports/components/SalesReport';
import StockValuationReport from '@/features/reports/components/StockValuationReport';
import SalesFieldReport from '@/features/reports/components/SalesFieldReport';

interface ReportsIndexProps {
    branches: any[];
    filters: {
        start_date: string;
        end_date: string;
        branch_id: string;
    };
    salesSummary: any;
    productPerformance: any;
    stockReport: any;
    salesFieldReport: any;
}

export default function ReportsIndex({ branches, filters, salesSummary, productPerformance, stockReport, salesFieldReport }: ReportsIndexProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || 'ALL');
    const [activeTab, setActiveTab] = useState('sales');

    // Mendeteksi tab aktif dari parameter URL (misalnya dari klik menu sidebar)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');

        if (tabParam && ['sales', 'products', 'stock', 'sales_field'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    const handleApply = (start = startDate, end = endDate, br = branchId, tab = activeTab) => {
        router.get('/business/reports', {
            start_date: start || undefined,
            end_date: end || undefined,
            branch_id: br !== 'ALL' ? br : undefined,
            tab: tab
        }, { preserveState: true });
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        handleApply(startDate, endDate, branchId, newTab);
    };

    // Fungsi Ekspor Berkas Excel Cerdas (.csv format)
    const handleExportExcel = () => {
        let headers: string[] = [];
        let rows: any[] = [];
        let filename = '';

        if (activeTab === 'sales') {
            filename = `Laporan_Penjualan_Operasional_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Tanggal Penjualan', 'Total Pendapatan (IDR)', 'Volume Transaksi'];
            rows = salesSummary.all_daily_sales.map((item: any) => [
                new Date(item.date).toLocaleDateString('id-ID'),
                item.total_revenue,
                item.tx_count || 0
            ]);
        } else if (activeTab === 'products') {
            filename = `Performa_Produk_Terlaris_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Nama Produk', 'SKU', 'Total Kuantitas Terjual', 'Total Omset Jual (IDR)', 'Estimasi Laba Bersih (IDR)'];
            rows = productPerformance.top_products.map((item: any) => [
                item.name,
                item.sku,
                item.qty_sold,
                item.revenue,
                item.profit
            ]);
        } else if (activeTab === 'stock') {
            filename = `Valuasi_Stok_Realtime_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Metrik Inventori', 'Jumlah / Nilai (IDR)'];
            rows = [
                ['Total Variasi Produk (SKU)', stockReport.total_items],
                ['Produk Stok Habis (Out of Stock)', stockReport.out_of_stock],
                ['Produk Stok Menipis (< 5 pcs)', stockReport.low_stock],
                ['Valuasi Nilai Harta (Harga Modal / Base Cost)', stockReport.cost_valuation],
                ['Valuasi Nilai Jual (Harga Retail / Price)', stockReport.retail_valuation],
                ['Estimasi Margin Harta Cadangan', stockReport.retail_valuation - stockReport.cost_valuation]
            ];
        } else if (activeTab === 'sales_field') {
            filename = `Performa_Sales_Lapangan_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Nama Sales', 'Cabang', 'Kunjungan', 'Order', 'Konversi (%)', 'Total Omset (IDR)'];
            rows = salesFieldReport.leaderboard.map((item: any) => [
                item.name,
                item.branch,
                item.visits_count,
                item.orders_count,
                item.conversion_rate,
                item.total_revenue
            ]);
        }

        // Generate CSV UTF-8 semi-kolon agar langsung rapi dibuka di MS Excel Indonesia
        const csvContent = "\uFEFF" + [
            headers.join(';'),
            ...rows.map(e => e.map((val: any) => {
                if (typeof val === 'string') {
                    return `"${val.replace(/"/g, '""')}"`;
                }

                return val;
            }).join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MainLayout>
            <Head title="Dashboard Analisis Laporan Operasional Bisnis" />

            <div className="space-y-6">
                {/* Kepala Halaman & Saringan Laporan */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                            <PieChart className="h-6 w-6 text-indigo-650 animate-bounce" /> Analisis Laporan Toko
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                            Pemantauan menyeluruh untuk volume transaksi penjualan, performa pergerakan produk terlaris, serta kondisi stok gudang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                        <div className="flex items-center gap-1 bg-white border rounded-md px-2 py-1 shadow-sm shrink-0 border-slate-200">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <input 
                                type="date" 
                                className="border-0 p-0.5 text-xs focus:ring-0 focus:outline-none w-[115px] bg-transparent text-slate-700"
                                value={startDate}
                                onChange={(e) => {
 setStartDate(e.target.value); handleApply(e.target.value, endDate, branchId); 
}}
                            />
                            <span className="text-[10px] text-slate-400 font-bold px-1">s/d</span>
                            <input 
                                type="date" 
                                className="border-0 p-0.5 text-xs focus:ring-0 focus:outline-none w-[115px] bg-transparent text-slate-700"
                                value={endDate}
                                onChange={(e) => {
 setEndDate(e.target.value); handleApply(startDate, e.target.value, branchId); 
}}
                            />
                        </div>

                        <Select value={branchId} onValueChange={(val) => {
 setBranchId(val); handleApply(startDate, endDate, val); 
}}>
                            <SelectTrigger className="w-[150px] h-9 text-xs shadow-sm bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="Semua Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Cabang</SelectItem>
                                {branches?.map((b: any) => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button 
                            onClick={handleExportExcel}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black gap-1.5 h-9"
                        >
                            <Sparkles className="h-4 w-4" /> Ekspor Excel
                        </Button>

                        <Button 
                            onClick={() => {
                                const params = new URLSearchParams({
                                    start_date: startDate || '',
                                    end_date: endDate || '',
                                    branch_id: branchId || '',
                                    format: 'pdf'
                                });
                                window.open(`/export/transactions?${params.toString()}`, '_blank');
                            }}
                            size="sm"
                            variant="outline"
                            className="border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-black gap-1.5 h-9 bg-white"
                        >
                            <Download className="h-4 w-4 text-rose-500" /> Ekspor PDF
                        </Button>
                    </div>
                </div>

                {/* Tab Navigasi */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => handleTabChange('sales')}
                        className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'sales' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <TrendingUp className="h-3.5 w-3.5" /> Laporan Penjualan (Sales)
                    </button>
                    <button
                        onClick={() => handleTabChange('products')}
                        className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'products' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" /> Laporan Performa Produk
                    </button>
                    <button
                        onClick={() => handleTabChange('stock')}
                        className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'stock' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Package2 className="h-3.5 w-3.5" /> Laporan Nilai Stok
                    </button>
                    <button
                        onClick={() => handleTabChange('sales_field')}
                        className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'sales_field' 
                                ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <TrendingUp className="h-3.5 w-3.5" /> Laporan Sales Lapangan
                    </button>
                </div>

                {/* Render Masing-Masing Sub-Komponen Laporan */}
                {activeTab === 'sales' && <SalesReport salesSummary={salesSummary} />}
                {activeTab === 'products' && <ProductPerformanceReport productPerformance={productPerformance} />}
                {activeTab === 'stock' && <StockValuationReport stockReport={stockReport} />}
                {activeTab === 'sales_field' && <SalesFieldReport salesFieldReport={salesFieldReport} />}
            </div>
        </MainLayout>
    );
}

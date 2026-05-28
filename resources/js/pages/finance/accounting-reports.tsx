import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/layouts/app/app-main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Landmark, ArrowRightLeft, FileText, Calendar, Filter, Sparkles } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';

export default function AccountingReports({ ledger, balanceSheet, cashFlow, branches, filters }: any) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || 'ALL');
    const [activeTab, setActiveTab] = useState('ledger');

    const handleApply = (start = startDate, end = endDate, br = branchId) => {
        router.get('/accounting/reports', {
            start_date: start || undefined,
            end_date: end || undefined,
            branch_id: br !== 'ALL' ? br : undefined
        }, { preserveState: true });
    };

    const handleExportExcel = () => {
        let headers: string[] = [];
        let rows: any[] = [];
        let filename = '';

        if (activeTab === 'ledger') {
            filename = `Buku_Besar_Mutasi_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Cabang', 'Debit (Masuk)', 'Kredit (Keluar)', 'Saldo Berjalan'];
            rows = ledger.map((item: any) => [
                new Date(item.date).toLocaleString('id-ID'),
                item.type,
                item.category,
                item.description,
                item.branch,
                item.debit,
                item.credit,
                item.balance
            ]);
        } else if (activeTab === 'balance_sheet') {
            filename = `Neraca_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Kategori Akuntansi', 'Sub-Kategori', 'Jumlah Saldo (IDR)'];
            rows = [
                ['AKTIVA (ASET)', '', ''],
                ['', 'Saldo Kas & Liquid Utama', balanceSheet.assets.cash],
                ['', 'Saldo Piutang Pelanggan', balanceSheet.assets.receivables],
                ['', 'Nilai Persediaan Dagang Aktif', balanceSheet.assets.inventory],
                ['TOTAL AKTIVA', '', balanceSheet.assets.total],
                ['', '', ''],
                ['PASIVA (LIABILITAS & EKUITAS)', '', ''],
                ['', 'Saldo Hutang Pemasok (Kewajiban)', balanceSheet.liabilities.payables],
                ['', 'Laba Bersih Ditahan (Retained Earnings)', balanceSheet.equity.retained_earnings],
                ['', 'Modal Pemilik (Owner Equity)', balanceSheet.equity.owner_equity],
                ['TOTAL PASIVA', '', balanceSheet.total_pasiva]
            ];
        } else if (activeTab === 'cash_flow') {
            filename = `Laporan_Arus_Kas_${new Date().toISOString().split('T')[0]}.csv`;
            headers = ['Klasifikasi Arus Kas', 'Jenis Transaksi/Aktivitas', 'Saldo Aliran (IDR)'];
            rows = [
                ['1. AKTIVITAS OPERASIONAL', '', ''],
                ['', 'Pendapatan Penerimaan Omset Bisnis', balanceSheet.assets.cash],
                ['', 'Pemberian Biaya Operasional & HPP Pembelian', -(Math.abs(cashFlow.operating - balanceSheet.assets.cash))],
                ['', 'Net Arus Kas Operasional', cashFlow.operating],
                ['', '', ''],
                ['2. AKTIVITAS INVESTASI', '', ''],
                ['', 'Penanaman Modal & Pembelian Aset Berharga', cashFlow.investing],
                ['', '', ''],
                ['3. AKTIVITAS PENDANAAN', '', ''],
                ['', 'Peminjaman Modal & Kredit Pembiayaan', cashFlow.financing],
                ['', '', ''],
                ['KENAIKAN/PENURUNAN BERSIH ARUS KAS', '', cashFlow.net]
            ];
        }

        // Generate CSV content with BOM for Excel UTF-8 and Semicolon delimiter
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
            <Head title="Laporan Akuntansi Terintegrasi & Neraca Keuangan" />

            <div className="space-y-6">
                {/* Header halaman */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-indigo-600 animate-pulse" /> Laporan Akuntansi ERP
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Sistem pelaporan keuangan terpadu yang memetakan Buku Besar Mutasi Kas, Neraca Keseimbangan Aktiva-Pasiva, serta Arus Kas Operasional secara otomatis.
                        </p>
                    </div>

                    {/* Saringan Laporan Terpadu */}
                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                        <div className="flex items-center gap-1 bg-white border rounded-md px-2 py-1 shadow-sm shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <input 
                                type="date" 
                                className="border-0 p-0.5 text-xs focus:ring-0 focus:outline-none w-[115px]"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); handleApply(e.target.value, endDate, branchId); }}
                            />
                            <span className="text-[10px] text-slate-400 font-bold px-1">s/d</span>
                            <input 
                                type="date" 
                                className="border-0 p-0.5 text-xs focus:ring-0 focus:outline-none w-[115px]"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); handleApply(startDate, e.target.value, branchId); }}
                            />
                        </div>

                        <Select value={branchId} onValueChange={(val) => { setBranchId(val); handleApply(startDate, endDate, val); }}>
                            <SelectTrigger className="w-[150px] h-9 text-xs shadow-sm bg-white">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-9"
                        >
                            <Sparkles className="h-4 w-4" /> Ekspor Excel
                        </Button>
                    </div>
                </div>

                {/* Tombol Navigasi Tab Laporan */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'ledger' 
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Buku Besar Mutasi (General Ledger)
                    </button>
                    <button
                        onClick={() => setActiveTab('balance_sheet')}
                        className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'balance_sheet' 
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Landmark className="h-3.5 w-3.5" /> Neraca Keseimbangan (Balance Sheet)
                    </button>
                    <button
                        onClick={() => setActiveTab('cash_flow')}
                        className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'cash_flow' 
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileText className="h-3.5 w-3.5" /> Laporan Arus Kas (Cash Flow)
                    </button>
                </div>

                {/* TAB 1: BUKU BESAR MUTASI */}
                {activeTab === 'ledger' && (
                    <Card className="shadow-sm border">
                        <CardHeader className="bg-slate-50/50 p-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800">Buku Besar Mutasi Kas Terpadu</CardTitle>
                            <CardDescription className="text-xs">
                                Alur pencatatan kronologis dari seluruh transaksi keuangan termasuk kas kecil, pengeluaran kas operasional, dan pembelian stok dagang.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 text-sm">
                            {ledger.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    Tidak ada catatan mutasi transaksi dalam rentang tanggal dan cabang yang dipilih.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-100/50">
                                        <TableRow>
                                            <TableHead className="text-xs font-bold text-slate-700 w-[140px]">Tanggal & Waktu</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 w-[100px]">Jenis</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 w-[120px]">Kategori</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700">Keterangan Transaksi</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 w-[110px]">Cabang</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 text-right w-[130px]">Debit (Masuk)</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 text-right w-[130px]">Kredit (Keluar)</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 text-right w-[140px]">Saldo Berjalan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledger.map((item: any, idx: number) => (
                                            <TableRow key={idx} className="hover:bg-slate-50/40">
                                                <TableCell className="font-mono text-[11px] text-slate-500">
                                                    {new Date(item.date).toLocaleString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                        item.type === 'Buku Kas' ? 'bg-indigo-50 text-indigo-700' :
                                                        item.type === 'Biaya' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 font-bold capitalize">{item.category}</TableCell>
                                                <TableCell className="text-xs text-slate-700 font-medium">{item.description}</TableCell>
                                                <TableCell className="text-xs text-slate-500 font-bold">{item.branch}</TableCell>
                                                <TableCell className="text-right font-mono text-[11px] text-emerald-600 font-bold">
                                                    {item.debit > 0 ? formatRupiah(item.debit) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-[11px] text-red-600 font-bold">
                                                    {item.credit > 0 ? formatRupiah(item.credit) : '-'}
                                                </TableCell>
                                                <TableCell className={`text-right font-mono text-xs font-black ${item.balance >= 0 ? 'text-slate-800' : 'text-red-700'}`}>
                                                    {formatRupiah(item.balance)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB 2: NERACA KESEIMBANGAN */}
                {activeTab === 'balance_sheet' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* AKTIVA */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-slate-50/50 p-4 border-b">
                                <CardTitle className="text-sm font-bold text-slate-800">AKTIVA (Kekayaan & Aset)</CardTitle>
                                <CardDescription className="text-xs">Daftar harta cair, saldo piutang aktif, serta akumulasi aset stok fisik barang.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 text-sm">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-bold text-slate-700 pl-4">A. ASET LANCAR</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-slate-800"></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Saldo Kas & Liquid Utama</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.assets.cash)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Saldo Piutang Pelanggan (Receivables)</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.assets.receivables)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Nilai Persediaan Dagang Aktif (Inventory)</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.assets.inventory)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="bg-indigo-50 border-t font-black text-sm">
                                            <TableCell className="text-indigo-800 pl-4 uppercase">TOTAL AKTIVA (ASET BERJALAN)</TableCell>
                                            <TableCell className="text-right font-mono text-indigo-700 pr-4">
                                                {formatRupiah(balanceSheet.assets.total)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* PASIVA */}
                        <Card className="shadow-sm border">
                            <CardHeader className="bg-slate-50/50 p-4 border-b">
                                <CardTitle className="text-sm font-bold text-slate-800">PASIVA (Kewajiban & Modal Usaha)</CardTitle>
                                <CardDescription className="text-xs">Daftar kewajiban hutang, modal dasar, serta pendapatan laba bersih ditahan.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 text-sm">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-bold text-slate-700 pl-4">A. KEWAJIBAN (LIABILITIES)</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-slate-800"></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Saldo Hutang Pemasok (Accounts Payable)</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.liabilities.payables)}
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow className="border-t">
                                            <TableCell className="font-bold text-slate-700 pl-4">B. EKUITAS (EQUITY)</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-slate-800"></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Laba Bersih Ditahan (Retained Earnings)</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.equity.retained_earnings)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-8 text-slate-600">Modal Pemilik (Owner Equity)</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 pr-4">
                                                {formatRupiah(balanceSheet.equity.owner_equity)}
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow className="bg-indigo-50 border-t font-black text-sm">
                                            <TableCell className="text-indigo-800 pl-4 uppercase">TOTAL PASIVA (LIABILITAS + EKUITAS)</TableCell>
                                            <TableCell className="text-right font-mono text-indigo-700 pr-4">
                                                {formatRupiah(balanceSheet.total_pasiva)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: LAPORAN ARUS KAS */}
                {activeTab === 'cash_flow' && (
                    <Card className="shadow-sm border max-w-2xl mx-auto">
                        <CardHeader className="bg-slate-50/50 p-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800">Laporan Arus Kas Terintegrasi (Cash Flow Statement)</CardTitle>
                            <CardDescription className="text-xs">Pencatatan arus dana masuk dan keluar terperinci berdasarkan klasifikasi aktivitas operasional perusahaan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 text-sm">
                            <Table>
                                <TableBody>
                                    {/* OPERASIONAL */}
                                    <TableRow className="bg-slate-50/60 font-bold border-y">
                                        <TableCell className="text-slate-800 pl-4 uppercase">1. Aktivitas Operasional</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-800 pr-4"></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-8 text-slate-600">Pendapatan Penerimaan Omset Bisnis</TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600 pr-4">
                                            {formatRupiah(balanceSheet.assets.cash)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-8 text-slate-600">Pemberian Biaya Operasional & HPP Pembelian</TableCell>
                                        <TableCell className="text-right font-mono text-red-600 pr-4">
                                            - {formatRupiah(Math.abs(cashFlow.operating - balanceSheet.assets.cash))}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold">
                                        <TableCell className="pl-8 text-slate-800 italic">Net Arus Kas Operasional</TableCell>
                                        <TableCell className={`text-right font-mono pr-4 ${cashFlow.operating >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatRupiah(cashFlow.operating)}
                                        </TableCell>
                                    </TableRow>

                                    {/* INVESTASI */}
                                    <TableRow className="bg-slate-50/60 font-bold border-y">
                                        <TableCell className="text-slate-800 pl-4 uppercase">2. Aktivitas Investasi</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-800 pr-4"></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-8 text-slate-600">Penanaman Modal & Pembelian Aset Berharga</TableCell>
                                        <TableCell className={`text-right font-mono pr-4 ${cashFlow.investing >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatRupiah(cashFlow.investing)}
                                        </TableCell>
                                    </TableRow>

                                    {/* PENDANAAN */}
                                    <TableRow className="bg-slate-50/60 font-bold border-y">
                                        <TableCell className="text-slate-800 pl-4 uppercase">3. Aktivitas Pendanaan</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-800 pr-4"></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="pl-8 text-slate-600">Peminjaman Modal & Kredit Pembiayaan</TableCell>
                                        <TableCell className={`text-right font-mono pr-4 ${cashFlow.financing >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatRupiah(cashFlow.financing)}
                                        </TableCell>
                                    </TableRow>

                                    {/* TOTAL NET CASH FLOW */}
                                    <TableRow className="bg-indigo-50 border-t font-black text-sm">
                                        <TableCell className="text-indigo-800 pl-4 uppercase">KENAIKAN/PENURUNAN BERSIH ARUS KAS</TableCell>
                                        <TableCell className={`text-right font-mono pr-4 ${cashFlow.net >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                                            {formatRupiah(cashFlow.net)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

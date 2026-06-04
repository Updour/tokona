import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Phone, Mail, FileText, Wallet, AlertCircle, CheckCircle2, CircleDashed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/layouts/app/app-main-layout';

interface Props {
    supplier: any;
    stats: {
        total_belanja: number;
        total_hutang: number;
        total_po: number;
    };
}

export default function Show({ supplier, stats }: Props) {
    const renderStatusBadge = (status: string) => {
        if (status === 'draft') {
return <Badge variant="outline" className="text-muted-foreground"><CircleDashed className="mr-1 h-3 w-3" /> Draft</Badge>;
}

        if (status === 'received') {
return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><AlertCircle className="mr-1 h-3 w-3" /> Belum Lunas (Hutang)</Badge>;
}

        if (status === 'paid') {
return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Lunas</Badge>;
}

        return <Badge>{status}</Badge>;
    };

    return (
        <MainLayout>
            <Head title={`Profil Supplier: ${supplier.name}`} />

            {/* Header Actions */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/suppliers"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profil Pemasok</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Informasi lengkap dan rekap transaksi dengan {supplier.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* ─── Kolom Kiri: Info Supplier ─── */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="shadow-sm border-border">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{supplier.name}</CardTitle>
                                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                                        {supplier.status === 'active' ? 'Aktif Beroperasi' : 'Non-Aktif'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Kontak Person</span>
                                <span className="text-sm font-medium">{supplier.contact_person || 'Tidak ada data'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{supplier.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{supplier.email || '-'}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm pt-2 border-t">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{supplier.address || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Kolom Kanan: Statistik & Tabel ─── */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="shadow-sm border-border bg-gradient-to-br from-white to-slate-50">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Belanja (Sejarah)</p>
                                    <h3 className="text-2xl font-black text-slate-800">Rp {Number(stats.total_belanja).toLocaleString('id-ID')}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Dari {stats.total_po} Transaksi PO</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm border-red-100 bg-gradient-to-br from-red-50/50 to-white">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-600/80">Total Hutang Berjalan</p>
                                    <h3 className="text-2xl font-black text-red-600">Rp {Number(stats.total_hutang).toLocaleString('id-ID')}</h3>
                                    <p className="text-xs text-red-500/70 mt-1">Segera lunasi tagihan</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Riwayat PO */}
                    <Card className="shadow-sm border-border">
                        <CardHeader className="bg-muted/20 border-b py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Riwayat Transaksi (Purchase Orders)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>No. Invoice</TableHead>
                                        <TableHead>Cabang</TableHead>
                                        <TableHead className="text-right">Nominal</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supplier.purchases?.length ? (
                                        supplier.purchases.map((po: any) => (
                                            <TableRow key={po.id}>
                                                <TableCell className="text-sm">
                                                    {new Date(po.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/purchases/${po.id}`} className="font-mono font-medium text-primary hover:underline">
                                                        {po.invoice_number || 'Draft...'}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm">{po.branch?.name || '-'}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    Rp {Number(po.total_cost).toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {renderStatusBadge(po.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                Belum ada riwayat transaksi dengan supplier ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}

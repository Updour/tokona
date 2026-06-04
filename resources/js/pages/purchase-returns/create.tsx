import { Head, router, useForm } from '@inertiajs/react';
import lodash from 'lodash';
import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/layouts/app/app-main-layout';
const { cloneDeep, sumBy, findIndex, find } = lodash;

export default function Create({ branches, suppliers, products }: any) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: '',
        supplier_id: '',
        return_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [] as any[],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', qty: 1, unit_cost: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = cloneDeep(data.items);
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = cloneDeep(data.items);
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            const existingIndex = findIndex(newItems, (item: any, i: number) => item.product_id === value && i !== index);

            if (existingIndex !== -1) {
                newItems[existingIndex].qty += Number(newItems[index].qty || 1);
                newItems.splice(index, 1);
                toast.success('Produk sudah ada, jumlah diretur ditambahkan!');
                setData('items', newItems);

                return;
            }

            const product = find(products, { id: value });

            if (product) {
                newItems[index] = { ...newItems[index], product_id: value, unit_cost: Number(product.base_cost) || 0 };
            }
        }

        setData('items', newItems);
    };

    const totalNilai = sumBy(data.items, (item: any) => Number(item.qty) * Number(item.unit_cost));

    const isFormValid = 
        data.branch_id !== '' && 
        data.supplier_id !== '' && 
        data.return_date !== '' && 
        data.items.length > 0 && 
        data.items.every((item: any) => item.product_id !== '' && item.qty > 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid) {
            toast.error("Formulir belum lengkap. Harap lengkapi semua data wajib (*).");

            return;
        }

        post('/purchase-returns', {
            onSuccess: () => toast.success('Retur berhasil disimpan!'),
        });
    };

    return (
        <MainLayout>
            <Head title="Buat Retur Pembelian" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                    <RotateCcw className="h-6 w-6" /> Buat Dokumen Retur
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Kembalikan barang rusak/cacat ke Pemasok. Stok barang di Inventory akan otomatis berkurang (OUT).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-red-100">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Cabang Asal (Pengirim) <span className="text-red-500">*</span></Label>
                                <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                    <SelectTrigger className={errors.branch_id ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder="Pilih Cabang Gudang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.branch_id && <span className="text-xs text-red-500">{errors.branch_id}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Supplier Tujuan <span className="text-red-500">*</span></Label>
                                <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                    <SelectTrigger className={errors.supplier_id ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder="Pilih Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.supplier_id && <span className="text-xs text-red-500">{errors.supplier_id}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-red-100">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Tanggal Retur <span className="text-red-500">*</span></Label>
                                <Input type="date" value={data.return_date} onChange={(e) => setData('return_date', e.target.value)} />
                                {errors.return_date && <span className="text-xs text-red-500">{errors.return_date}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Alasan / Catatan</Label>
                                <Textarea placeholder="Tulis alasan retur (misal: Barang kedaluwarsa)..." value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Keranjang Retur */}
                <Card className="shadow-sm border-red-200 overflow-hidden">
                    <div className="bg-red-50 p-4 border-b text-sm font-bold text-red-800 flex items-center gap-2">
                        Daftar Barang yang Diretur
                    </div>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-red-50/50">
                                <TableRow>
                                    <TableHead className="w-[100px] text-center p-2">
                                        <Button type="button" size="sm" className="h-7 w-full shadow-sm text-xs bg-red-600 hover:bg-red-700 text-white" onClick={addItem}>
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[350px]">Pilih Produk</TableHead>
                                    <TableHead className="w-[120px]">Jml (Qty)</TableHead>
                                    <TableHead className="w-[200px]">Harga Modal</TableHead>
                                    <TableHead className="w-[200px]">Subtotal</TableHead>
                                    <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-8 text-muted-foreground italic">
                                            Keranjang masih kosong. Klik tombol "+ Tambah" di kiri atas untuk memulai.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data.items.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-red-50/30">
                                        <TableCell className="align-top text-center px-2">
                                            <div className="h-10 flex items-center justify-center text-xs font-bold text-red-800 bg-red-100 rounded-md border border-red-200 border-dashed">
                                                #{idx + 1}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Select value={item.product_id} onValueChange={(v) => updateItem(idx, 'product_id', v)}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Cari Produk..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((p: any) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} {p.track_stock ? '' : '(Non-Fisik)'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                                                <Input type="number" className="pl-8" min="0" value={item.unit_cost} onChange={(e) => updateItem(idx, 'unit_cost', e.target.value)} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-10 flex items-center px-3 bg-red-50 rounded-md border border-red-100 font-bold text-sm text-red-700">
                                                Rp {(Number(item.qty) * Number(item.unit_cost)).toLocaleString('id-ID')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-top">
                                            <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => removeItem(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Footer Submit */}
                <div className="flex flex-col items-end gap-6 bg-red-50/50 p-6 rounded-xl border border-red-200 mt-6">
                    <div className="flex flex-col items-end w-full border-b border-red-200 pb-4">
                        <span className="text-red-800 text-sm font-semibold tracking-widest uppercase mb-1">Total Nilai Retur</span>
                        <span className="text-4xl font-extrabold text-red-600">Rp {totalNilai.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex gap-3 w-full justify-end">
                        <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.get('/purchase-returns')}>Batal</Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !isFormValid} 
                            size="lg" 
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="mr-2 h-5 w-5" /> {processing ? 'Memproses...' : (isFormValid ? 'Simpan & Potong Stok Gudang' : 'Lengkapi Form Dulu')}
                        </Button>
                    </div>
                </div>
            </form>
        </MainLayout>
    );
}

import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Receipt, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import lodash from 'lodash';
const { find, sumBy } = lodash;
import { getTodayDateString } from '@/lib/helpers/date';

export function PurchaseForm({ branches, products, suppliers }: { branches: any[], products: any[], suppliers: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: '',
        supplier_id: '',
        invoice_number: '',
        purchase_date: getTodayDateString(),
        status: 'draft',
        global_discount: 0,
        items: [] as any[]
    });

    // Fix TypeScript 'any' type index error for nested errors
    const formErrors = errors as Record<string, string>;

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', qty: 1, unit_cost: 0, discount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) {
            toast.error('Minimal harus ada 1 barang dalam pembelian.');
            return;
        }
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            const existingIndex = newItems.findIndex((item, i) => item.product_id === value && i !== index);

            if (existingIndex !== -1) {
                newItems[existingIndex].qty += Number(newItems[index].qty || 1);
                newItems.splice(index, 1);
                toast.success('Produk sudah ada di keranjang. Jumlah (Qty) otomatis ditambahkan!');
                setData('items', newItems);
                return;
            }

            const selectedProduct = find(products, { id: value });
            if (selectedProduct) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    unit_cost: Number(selectedProduct.base_cost) || 0,
                    discount: 0
                };
            }
        }

        setData('items', newItems);
    };

    const totalBiayaProduk = sumBy(data.items, (item: any) => (Number(item.qty) * Number(item.unit_cost)) - Number(item.discount || 0));
    const totalTagihan = totalBiayaProduk - Number(data.global_discount || 0);

    const generateInvoice = () => {
        if (!data.branch_id) {
            toast.error("Pilih cabang penerima terlebih dahulu!");
            return;
        }
        const branch = branches.find(b => b.id === data.branch_id);
        const branchCode = branch?.code || branch?.name?.substring(0, 3).toUpperCase() || 'CAB';
        const dateStr = data.purchase_date.replace(/-/g, '');
        const randomStr = Math.floor(1000 + Math.random() * 9000);

        setData('invoice_number', `INV/${branchCode}/${dateStr}/${randomStr}`);
        toast.success("Nomor Invoice berhasil digenerate otomatis!");
    };

    const isFormValid = 
        data.branch_id !== '' && 
        data.supplier_id !== '' &&
        data.invoice_number !== '' &&
        data.purchase_date !== '' && 
        data.status !== '' && 
        data.items.length > 0 && 
        data.items.every(item => item.product_id !== '' && item.qty > 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid) {
            toast.error("Formulir belum lengkap. Harap lengkapi semua data wajib (*).");
            return;
        }

        post('/purchases', {
            onError: (err) => {
                toast.error('Gagal menyimpan. Cek kembali form Anda.');
                console.error(err);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Informasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Info Vendor & Cabang */}
                <Card className="shadow-sm border-border">
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Cabang Penerima <span className="text-red-500">*</span></Label>
                            <Select value={data.branch_id} onValueChange={(val) => setData('branch_id', val)}>
                                <SelectTrigger className={errors.branch_id ? 'border-red-500 w-full' : 'w-full'}>
                                    <SelectValue placeholder="Pilih Cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.branch_id && <span className="text-xs text-red-500">{errors.branch_id}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Supplier (Pemasok)</Label>
                            <Select value={data.supplier_id} onValueChange={(val) => setData('supplier_id', val)}>
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

                {/* Info Dokumen */}
                <Card className="shadow-sm border-border">
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Nomor Invoice / Resi</Label>
                            <div className="flex relative">
                                <Input
                                    placeholder="Opsional (Mis: INV-001)"
                                    value={data.invoice_number}
                                    onChange={(e) => setData('invoice_number', e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                                    onClick={generateInvoice}
                                    title="Generate Otomatis"
                                >
                                    <Wand2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Beli <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                    className={errors.purchase_date ? 'border-red-500' : ''}
                                />
                                {errors.purchase_date && <span className="text-xs text-red-500">{errors.purchase_date}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Status <span className="text-red-500">*</span></Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">PO / Draft (Stok tidak berubah)</SelectItem>
                                        <SelectItem value="received">Diterima (Otomatis masuk stok)</SelectItem>
                                        <SelectItem value="paid">Lunas (Otomatis masuk stok)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Keranjang Belanja */}
            <Card className="shadow-sm overflow-hidden mt-8 border-border">
                <div className="bg-muted/40 p-4 border-b text-sm font-semibold flex items-center gap-2 text-primary">
                    <Receipt className="h-4 w-4" /> Daftar Produk (Keranjang)
                </div>

                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow>
                                <TableHead className="w-[100px] text-center p-2">
                                    <Button type="button" size="sm" variant="default" className="h-7 w-full shadow-sm text-xs" onClick={addItem}>
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[300px]">Pilih Produk</TableHead>
                                <TableHead className="w-[100px]">Jml (Qty)</TableHead>
                                <TableHead className="w-[160px]">Harga Beli/Pcs</TableHead>
                                <TableHead className="w-[160px]">Diskon/Baris</TableHead>
                                <TableHead className="w-[180px]">Total Harga</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center p-8 text-muted-foreground italic">
                                        Keranjang masih kosong. Klik tombol "+ Tambah" di kiri atas untuk memulai.
                                    </TableCell>
                                </TableRow>
                            )}
                            {data.items.map((item, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/20">
                                    <TableCell className="align-top text-center px-2">
                                        <div className="h-10 flex items-center justify-center text-xs font-bold text-muted-foreground bg-muted/50 rounded-md border border-dashed">
                                            #{idx + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Select value={item.product_id} onValueChange={(val) => updateItem(idx, 'product_id', val)}>
                                            <SelectTrigger className={`w-full ${formErrors[`items.${idx}.product_id`] ? 'border-red-500 bg-red-50' : ''}`}>
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
                                        {formErrors[`items.${idx}.product_id`] && <span className="text-xs text-red-500 mt-1 block">{formErrors[`items.${idx}.product_id`]}</span>}
                                    </TableCell>

                                    <TableCell className="align-top">
                                        <Input
                                            type="number" min="1"
                                            value={item.qty}
                                            onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                            className={formErrors[`items.${idx}.qty`] ? 'border-red-500 bg-red-50' : ''}
                                        />
                                        {formErrors[`items.${idx}.qty`] && <span className="text-xs text-red-500 mt-1 block">{formErrors[`items.${idx}.qty`]}</span>}
                                    </TableCell>

                                    <TableCell className="align-top">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                                            <Input
                                                type="number" min="0" step="any"
                                                value={item.unit_cost}
                                                onChange={(e) => updateItem(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                className={`pl-8 ${formErrors[`items.${idx}.unit_cost`] ? 'border-red-500 bg-red-50' : ''}`}
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                                            <Input
                                                type="number" min="0" step="any"
                                                value={item.discount || ''}
                                                onChange={(e) => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                                                className={`pl-8 ${formErrors[`items.${idx}.discount`] ? 'border-red-500 bg-red-50' : ''}`}
                                                placeholder="Opsional"
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top">
                                        <div className="h-10 flex items-center px-3 bg-primary/5 rounded-md border border-primary/20 font-bold text-sm text-primary">
                                            Rp {((Number(item.qty) * Number(item.unit_cost)) - Number(item.discount || 0)).toLocaleString('id-ID')}
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top text-center">
                                        <Button
                                            type="button" variant="ghost" size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeItem(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Total & Submit */}
            <div className="flex flex-col items-end gap-6 bg-muted/20 p-6 rounded-lg border-2 border-border mt-6">

                {/* Bagian Atas: Angka Total Tagihan & Diskon Global */}
                <div className="flex flex-col items-end w-full border-b pb-6 gap-4">
                    <div className="flex items-center justify-end gap-4 w-full text-muted-foreground text-sm font-medium">
                        <span>Total Nilai Barang:</span>
                        <span className="text-base">Rp {totalBiayaProduk.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex items-center justify-end gap-4 w-full">
                        <Label className="text-muted-foreground">Potongan / Diskon Nota (Rp):</Label>
                        <div className="relative w-48">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">Rp</span>
                            <Input
                                type="number" min="0" step="any"
                                value={data.global_discount || ''}
                                onChange={(e) => setData('global_discount', parseFloat(e.target.value) || 0)}
                                className="pl-8 text-right font-bold text-red-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-end mt-4 pt-4 border-t border-dashed border-muted-foreground/30 w-full sm:w-1/2">
                        <span className="text-muted-foreground text-sm font-semibold tracking-widest uppercase mb-1">Total Tagihan Bersih</span>
                        <span className="text-4xl font-extrabold text-primary">Rp {totalTagihan.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Bagian Bawah: Tombol Batal & Simpan berderet ke samping */}
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
                    <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto font-semibold" onClick={() => router.get('/purchases')}>
                        Batalkan Transaksi
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing || !isFormValid} 
                        size="lg" 
                        className="w-full sm:w-auto font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {processing ? 'Menyimpan...' : (isFormValid ? 'Simpan Pembelian' : 'Lengkapi Form Dulu')}
                    </Button>
                </div>

            </div>
        </form>
    );
}

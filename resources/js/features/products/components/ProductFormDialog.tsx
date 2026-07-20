import { useForm, usePage } from '@inertiajs/react';
import { Package, DollarSign, Warehouse, Info, ChevronRight, Images, Wand2, X, Sparkles, Link } from 'lucide-react';
import * as React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah } from '@/lib/helpers/format';
import { useProductStore } from '@/pages/products/stores/useProductStore';
import type { ProductCategory, ProductType, ProductBranch, ProductTenant } from '@/pages/products/types';
import { store as productsStore, update as productsUpdate } from '@/routes/products';
import { ProductImageUploader } from './ProductImageUploader';
import { compressImage } from '@/lib/helpers/image-compression';
import { Plus, Trash2 } from 'lucide-react';
import { SearchableCreatableSelect } from './SearchableCreatableSelect';

// ─── Komponen pembantu ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: {
    icon: React.ElementType;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-start gap-3 pb-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-semibold leading-tight">{title}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
        </div>
    );
}

function Field({ label, required, error, children }: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

// ─── Dialog Utama ─────────────────────────────────────────────────────────────

export function ProductFormDialog() {
    const { isFormOpen, selectedProduct, closeForm } = useProductStore();
    const { props } = usePage<{
        categories: ProductCategory[];
        types: ProductType[];
        branches: ProductBranch[];
        tenants: ProductTenant[] | null;
        all_products: { id: string, name: string, base_cost: number }[];
        is_super_admin: boolean;
        auth: { user: { branch_id: string; tenant_id: string; is_super_admin: boolean } };
        suppliers?: any[];
    }>();

    const { categories = [], types = [], branches = [], tenants, all_products = [], auth, suppliers = [] } = props;
    const isSuperAdmin = props.is_super_admin ?? auth?.user?.is_super_admin ?? false;
    const isEdit = !!selectedProduct;

    // Branches yang difilter berdasarkan tenant yang dipilih (untuk super admin)
    const [filteredBranches, setFilteredBranches] = React.useState<ProductBranch[]>(branches);
    const [filteredCategories, setFilteredCategories] = React.useState<ProductCategory[]>(categories);
    const [filteredTypes, setFilteredTypes] = React.useState<ProductType[]>(types);
    const [filteredSuppliers, setFilteredSuppliers] = React.useState<any[]>(suppliers);

    const [importUrl, setImportUrl] = React.useState('');
    const [isImporting, setIsImporting] = React.useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        tenant_id: '',
        branch_id: '',
        category_id: '',
        new_category_name: '',
        type_id: '',
        new_type_name: '',
        supplier_id: '',
        new_supplier_name: '',
        name: '',
        sku: '',
        barcode: '',
        description: '',
        base_cost: '',
        sell_price: '',
        min_sell_price: '',
        track_stock: true,
        allow_negative_stock: false,
        is_bundle: false,
        bundle_items: [] as { product_id: string, quantity: number }[],
        source: '',
        is_active: true,
        initial_stock: '',
        images: [] as File[],
        expired_at: '',
        unit: 'Pcs',
        imported_image_url: '',
    });

    const generateSKU = (data: { category_id: string; new_category_name?: string; name: string }) => {
        const skuParts = [];

        // 1. Singkatan Kategori (Opsional)
        let categoryName = '';
        if (data.category_id) {
            const cat = categories.find(c => c.id === data.category_id);
            if (cat) categoryName = cat.name;
        } else if (data.new_category_name) {
            categoryName = data.new_category_name;
        }

        if (categoryName) {
            // 1. Bersihkan karakter non-alphanumeric dan ubah ke huruf besar
            const cleanName = categoryName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

            // 2. Hapus semua huruf vokal (A, E, I, O, U)
            const consonantOnly = cleanName.replace(/[AEIOU]/g, '');

            // 3. Jika setelah dihapus vokalnya karakternya kurang dari 3 (misal kategori pendek), gunakan nama asli
            const baseString = consonantOnly.length >= 3 ? consonantOnly : cleanName;

            // 4. Ambil 3 huruf pertama
            skuParts.push(baseString.substring(0, 3));
        }

        // 2. Singkatan Nama Produk
        if (data.name) {
            const words = data.name.trim().split(/\s+/).filter(w => w.length > 0);

            if (words.length > 0) {
                // Kata pertama: ambil maks 3 huruf (e.g. Mie -> MIE)
                skuParts.push(words[0].substring(0, 3).toUpperCase());
            }

            if (words.length > 1) {
                // Kata kedua: ambil konsonan maks 3 huruf (e.g. Sedaap -> SDP)
                const consonants = words[1].replace(/[AEIOUaeiou]/ig, '');
                const part2 = consonants.length > 0 ? consonants.substring(0, 3).toUpperCase() : words[1].substring(0, 3).toUpperCase();
                skuParts.push(part2);
            }
        }

        // Jika tidak ada kategori dan nama belum diisi, pakai awalan PRD
        if (skuParts.length === 0) {
            skuParts.push('PRD', Math.random().toString(36).substring(2, 5).toUpperCase());
        }

        // 3. Tambahkan 3 angka acak sebagai ID unik (menghindari duplikat jika nama mirip)
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        skuParts.push(randomNum);

        const sku = skuParts.join('-');
        setData('sku', sku);
        return sku;
    }

    const generateBarcode = () => {
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        setData('barcode', result);
    }

    const handleImportFromUrl = async () => {
        if (!importUrl) {
            toast.error('Masukkan URL produk terlebih dahulu.');
            return;
        }
        setIsImporting(true);
        try {
            const response = await axios.post('/products/import-url', { url: importUrl });
            if (response.data.success && response.data.data) {
                const p = response.data.data;
                
                // 1. Generate 12-digit Barcode
                let barcodeResult = '';
                for (let i = 0; i < 12; i++) {
                    barcodeResult += Math.floor(Math.random() * 10).toString();
                }

                // 2. Match Category and Type returned by AI with existing lists
                let categoryIdToSet = '';
                let newCategoryNameToSet = '';
                if (p.category) {
                    const matchedCat = categories.find(
                        c => c.name.toLowerCase().trim() === p.category.toLowerCase().trim()
                    );
                    if (matchedCat) {
                        categoryIdToSet = matchedCat.id;
                    } else {
                        newCategoryNameToSet = p.category;
                    }
                }

                let typeIdToSet = '';
                let newTypeNameToSet = '';
                if (p.type) {
                    const matchedType = types.find(
                        t => t.name.toLowerCase().trim() === p.type.toLowerCase().trim()
                    );
                    if (matchedType) {
                        typeIdToSet = matchedType.id;
                    } else {
                        newTypeNameToSet = p.type;
                    }
                }

                // 3. Generate SKU using Tokona's exact local function based on matched category
                const generatedSku = generateSKU({
                    category_id: categoryIdToSet,
                    new_category_name: newCategoryNameToSet,
                    name: p.name || ''
                });

                setData((prev: any) => ({
                    ...prev,
                    name: p.name || prev.name,
                    sell_price: p.sell_price ? p.sell_price.toString() : prev.sell_price,
                    description: p.description || prev.description,
                    unit: p.unit || prev.unit || 'Pcs',
                    category_id: categoryIdToSet || prev.category_id,
                    new_category_name: newCategoryNameToSet || prev.new_category_name,
                    type_id: typeIdToSet || prev.type_id,
                    new_type_name: newTypeNameToSet || prev.new_type_name,
                    barcode: barcodeResult,
                    sku: generatedSku,
                    imported_image_url: p.image_url || prev.imported_image_url,
                }));
                toast.success('Data produk berhasil diimpor! Silakan periksa form.');
                setImportUrl('');
            } else {
                toast.error(response.data.message || 'Gagal mengimpor produk.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghubungi server untuk impor.');
        } finally {
            setIsImporting(false);
        }
    };

    // Filter data saat tenant berubah (super admin)
    useEffect(() => {
        if (isSuperAdmin && data.tenant_id) {
            setFilteredBranches(branches.filter((b) => !b.tenant_id || b.tenant_id === data.tenant_id));
            setFilteredCategories(categories.filter((c) => !c.tenant_id || c.tenant_id === data.tenant_id));
            setFilteredTypes(types.filter((t) => !t.tenant_id || t.tenant_id === data.tenant_id));
            setFilteredSuppliers(suppliers.filter((s) => !s.tenant_id || s.tenant_id === data.tenant_id));
        } else {
            setFilteredBranches(branches);
            setFilteredCategories(categories);
            setFilteredTypes(types);
            setFilteredSuppliers(suppliers);
        }
    }, [data.tenant_id, branches, categories, types, suppliers, isSuperAdmin]);

    useEffect(() => {
        if (selectedProduct) {
            setData({
                tenant_id: selectedProduct.tenant_id ?? '',
                branch_id: selectedProduct.branch_id ?? auth?.user?.branch_id ?? '',
                category_id: selectedProduct.category_id ?? '',
                new_category_name: '',
                type_id: selectedProduct.type_id ?? '',
                new_type_name: '',
                supplier_id: selectedProduct.supplier_id ?? '',
                new_supplier_name: '',
                name: selectedProduct.name ?? '',
                sku: selectedProduct.sku ?? '',
                barcode: selectedProduct.barcode ?? '',
                description: selectedProduct.description ?? '',
                base_cost: selectedProduct.base_cost?.toString() ?? '',
                sell_price: selectedProduct.sell_price?.toString() ?? '',
                min_sell_price: selectedProduct.min_sell_price?.toString() ?? '',
                track_stock: selectedProduct.track_stock ?? true,
                allow_negative_stock: selectedProduct.allow_negative_stock ?? false,
                is_bundle: selectedProduct.is_bundle ?? false,
                bundle_items: selectedProduct.bundleItems?.map((b: any) => ({ product_id: b.product_id, quantity: b.quantity })) ?? [],
                source: selectedProduct.source ?? '',
                is_active: selectedProduct.is_active ?? true,
                initial_stock: '',
                images: [],
                expired_at: selectedProduct.expired_at ?? '',
                unit: selectedProduct.unit ?? 'Pcs',
                imported_image_url: '',
            });
        } else {
            reset();

            if (!isSuperAdmin) {
                setData('tenant_id', auth?.user?.tenant_id ?? '');
                setData('branch_id', auth?.user?.branch_id ?? '');
            }
        }

        clearErrors();
    }, [selectedProduct, isFormOpen]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(productsUpdate(selectedProduct.id).url, { onSuccess: () => closeForm() });
        } else {
            post(productsStore().url, { onSuccess: () => closeForm() });
        }
    };

    const margin = data.base_cost && data.sell_price && Number(data.sell_price) > 0
        ? (((Number(data.sell_price) - Number(data.base_cost)) / Number(data.sell_price)) * 100).toFixed(1)
        : null;

    // Calculate bundle total base cost automatically
    useEffect(() => {
        if (data.is_bundle && data.bundle_items.length > 0) {
            let totalCost = 0;
            data.bundle_items.forEach(item => {
                const prod = all_products.find(p => p.id === item.product_id);
                if (prod) {
                    totalCost += (Number(prod.base_cost) * item.quantity);
                }
            });
            setData('base_cost', totalCost.toString());
        }
    }, [data.is_bundle, data.bundle_items, all_products]);

    const defaultUnits = React.useMemo(() => [
        { id: 'Pcs', name: 'Pcs' },
        { id: 'Bungkus', name: 'Bungkus' },
        { id: 'Pack', name: 'Pack' },
        { id: 'Box', name: 'Box' },
        { id: 'Slop', name: 'Slop' },
        { id: 'Renceng', name: 'Renceng' },
        { id: 'Dus', name: 'Dus' },
        { id: 'Sachet', name: 'Sachet' },
        { id: 'Kg', name: 'Kg' },
        { id: 'Liter', name: 'Liter' },
        { id: 'Botol', name: 'Botol' },
    ], []);

    const unitOptions = React.useMemo(() => {
        const list = [...defaultUnits];
        if (data.unit && !list.some(u => u.id === data.unit)) {
            list.push({ id: data.unit, name: data.unit });
        }
        return list;
    }, [data.unit, defaultUnits]);

    const [showAiImporter, setShowAiImporter] = React.useState(true);

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[820px] p-0 gap-0 max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Mengedit "${selectedProduct?.name}".`
                            : 'Isi detail produk di bawah. Kolom bertanda * wajib diisi.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                        {/* ── Seksi 1: Informasi Dasar ── */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <SectionHeader icon={Info} title="Informasi Dasar" description="Identitas produk dan klasifikasinya" />
                                {!isEdit && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAiImporter(!showAiImporter)}
                                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-slate-700"
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                                        <span>{showAiImporter ? 'Sembunyikan AI Impor' : 'Impor dari URL AI'}</span>
                                    </Button>
                                )}
                            </div>

                            {/* AI Importer Block */}
                            {!isEdit && showAiImporter && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 dark:bg-slate-900/60 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-350">
                                        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                                        <span>Impor Produk Instan dari URL Toko</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Masukkan link produk dari Tokopedia atau toko online umum lainnya, sistem akan otomatis menarik Nama, Harga, Deskripsi, dan Gambar Produk secara cerdas menggunakan AI.
                                    </p>
                                    <div className="flex gap-2 pt-1.5">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                type="url"
                                                value={importUrl}
                                                onChange={(e) => setImportUrl(e.target.value)}
                                                placeholder="Tempel link Tokopedia / produk di sini..."
                                                className="pl-9 h-9 text-xs"
                                                disabled={isImporting}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleImportFromUrl}
                                            disabled={isImporting}
                                            className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 flex items-center gap-1.5"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    <span>Impor</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Super admin: pilih tenant dulu */}
                            {isSuperAdmin && (
                                <Field label="Tenant / Toko" required error={errors.tenant_id}>
                                    <Select
                                        value={data.tenant_id || '__none__'}
                                        onValueChange={(v) => {
                                            const val = v === '__none__' ? '' : v;
                                            setData((prev: any) => ({ ...prev, tenant_id: val, branch_id: '' }));
                                        }}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Pilih tenant..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                <span className="text-muted-foreground">Pilih tenant...</span>
                                            </SelectItem>
                                            {(tenants ?? []).map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="sm:col-span-3">
                                    <Field label="Nama Produk" required error={errors.name}>
                                        <Input
                                            value={data.name.toUpperCase()}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Aqua Mineral Water 600ml"
                                            required
                                            minLength={5}
                                        />
                                    </Field>
                                </div>
                                <div className="sm:col-span-1">
                                    <Field label="Satuan" error={errors.unit}>
                                        <SearchableCreatableSelect
                                            options={unitOptions}
                                            value={data.unit}
                                            newValue={data.unit}
                                            onValueChange={(v) => { if (v) setData('unit', v); }}
                                            onNewValueChange={(v) => { if (v) setData('unit', v); }}
                                            placeholder="Pilih satuan..."
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="SKU / Kode Produk" error={errors.sku}>
                                    <div className="flex gap-2">
                                        <Input
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                            placeholder="Otomatis jika kosong"
                                            className="font-mono"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0 text-muted-foreground hover:text-primary"
                                            title="Buat Smart SKU"
                                            onClick={() => generateSKU({ category_id: data.category_id, name: data.name })}
                                        >
                                            <Wand2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Field>
                                <Field label="Barcode" error={errors.barcode}>
                                    <div className="flex gap-2">
                                        <Input
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            placeholder="Scan barcode di sini..."
                                            className="font-mono"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0 text-muted-foreground hover:text-primary"
                                            title="Generate Random Barcode"
                                            onClick={generateBarcode}
                                        >
                                            <Wand2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Kategori" error={errors.category_id || errors.new_category_name}>
                                    <SearchableCreatableSelect
                                        options={filteredCategories.map(c => ({
                                            id: c.id,
                                            name: c.name,
                                            tenantName: isSuperAdmin && c.tenant_id && tenants ? tenants.find(t => t.id === c.tenant_id)?.name : undefined
                                        }))}
                                        value={data.category_id}
                                        newValue={data.new_category_name}
                                        onValueChange={(v) => {
                                            setData('category_id', v);
                                            generateSKU({ category_id: v, name: data.name });
                                        }}
                                        onNewValueChange={(v) => setData('new_category_name', v)}
                                        placeholder="Pilih kategori..."
                                    />
                                </Field>

                                <Field label="Tipe Produk" error={errors.type_id || errors.new_type_name}>
                                    <SearchableCreatableSelect
                                        options={filteredTypes.map(t => ({
                                            id: t.id,
                                            name: t.name,
                                            tenantName: isSuperAdmin && t.tenant_id && tenants ? tenants.find(te => te.id === t.tenant_id)?.name : undefined
                                        }))}
                                        value={data.type_id}
                                        newValue={data.new_type_name}
                                        onValueChange={(v) => setData('type_id', v)}
                                        onNewValueChange={(v) => setData('new_type_name', v)}
                                        placeholder="Pilih tipe..."
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Cabang" required error={errors.branch_id}>
                                    <Select
                                        value={data.branch_id}
                                        onValueChange={(v) => setData('branch_id', v)}
                                        disabled={isSuperAdmin && !data.tenant_id}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder={isSuperAdmin && !data.tenant_id ? 'Pilih tenant dulu...' : 'Pilih cabang...'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredBranches.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name}
                                                    {b.code && <span className="ml-1.5 text-muted-foreground font-mono text-xs">({b.code})</span>}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Supplier" error={errors.supplier_id || errors.new_supplier_name}>
                                    <SearchableCreatableSelect
                                        options={filteredSuppliers.map(s => ({
                                            id: s.id,
                                            name: s.name,
                                            tenantName: isSuperAdmin && s.tenant_id && tenants ? tenants.find(t => t.id === s.tenant_id)?.name : undefined
                                        }))}
                                        value={data.supplier_id}
                                        newValue={data.new_supplier_name}
                                        onValueChange={(v) => setData('supplier_id', v)}
                                        onNewValueChange={(v) => setData('new_supplier_name', v)}
                                        placeholder="Pilih supplier..."
                                    />
                                </Field>
                            </div>

                            <Field label="Deskripsi" error={errors.description}>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi produk, catatan, atau spesifikasi (opsional)..."
                                    className="h-20 resize-none"
                                />
                            </Field>
                        </div>

                        <Separator />

                        {/* ── Seksi 2: Harga ── */}
                        <div className="space-y-4">
                            <SectionHeader icon={DollarSign} title="Harga" description="Atur HPP, harga jual, dan batas harga minimum" />

                            <div className="grid grid-cols-3 gap-4">
                                <Field label="HPP (Harga Pokok)" required error={errors.base_cost}>
                                    <Input type="text" value={data.base_cost ? formatRupiah(data.base_cost) : ''} onChange={(e) => setData('base_cost', e.target.value.replace(/\D/g, ''))} placeholder="Rp 0" required />
                                </Field>
                                <Field label="Harga Jual" required error={errors.sell_price}>
                                    <Input type="text" value={data.sell_price ? formatRupiah(data.sell_price) : ''} onChange={(e) => setData('sell_price', e.target.value.replace(/\D/g, ''))} placeholder="Rp 0" required />
                                </Field>
                                <Field label="Harga Min. Jual" error={errors.min_sell_price}>
                                    <Input type="text" value={data.min_sell_price ? formatRupiah(data.min_sell_price) : ''} onChange={(e) => setData('min_sell_price', e.target.value.replace(/\D/g, ''))} placeholder="Batas bawah" />
                                </Field>
                            </div>

                            {margin !== null && (
                                <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-2.5 text-sm">
                                    <span className="text-muted-foreground">Margin:</span>
                                    <span className={`font-semibold ${Number(margin) >= 0 ? 'text-green-600' : 'text-destructive'}`}>{margin}%</span>
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Keuntungan per unit:</span>
                                    <span className="font-semibold">{formatRupiah(Number(data.sell_price) - Number(data.base_cost))}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* ── Seksi 3: Stok & Status ── */}
                        <div className="space-y-4">
                            <SectionHeader icon={Warehouse} title="Stok & Status" description="Atur pelacakan inventori dan ketersediaan produk" />

                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {!isEdit ? (
                                        <div className="rounded-lg border border-dashed p-4 space-y-2 bg-muted/30">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Stok Awal (Opsional)</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Masukkan jumlah stok awal. Sistem akan otomatis membuat catatan <strong>Stock IN</strong> pertama.
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Input type="number" min="0" step="1" value={data.initial_stock} onChange={(e) => setData('initial_stock', e.target.value)} placeholder="0" className="max-w-[140px]" />
                                                <span className="text-sm text-muted-foreground">unit</span>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className={`rounded-lg border p-4 space-y-2 bg-muted/10 ${isEdit ? 'sm:col-span-2' : ''}`}>
                                        <label htmlFor="expired_at" className="block text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                            Tanggal Kedaluwarsa (Opsional)
                                        </label>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Isi jika produk memiliki masa kedaluwarsa (misal produk makanan atau obat).
                                        </p>
                                        <Input
                                            type="date"
                                            id="expired_at"
                                            value={data.expired_at}
                                            onChange={(e) => setData('expired_at', e.target.value)}
                                            className="max-w-[220px] mt-2"
                                        />
                                        {errors.expired_at && <p className="text-xs text-destructive mt-1">{errors.expired_at}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    <label className="flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
                                        <Checkbox id="track_stock" checked={data.track_stock} onCheckedChange={(c) => setData('track_stock', !!c)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold">Lacak Stok</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Pantau level inventori dan dapatkan peringatan stok menipis.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${data.track_stock ? 'hover:bg-muted/40' : 'opacity-40 cursor-not-allowed'}`}>
                                        <Checkbox id="allow_negative_stock" checked={data.allow_negative_stock} disabled={!data.track_stock} onCheckedChange={(c) => setData('allow_negative_stock', !!c)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold flex items-center gap-2">
                                                Izinkan Stok Negatif
                                                {data.allow_negative_stock && <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Aktif</Badge>}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Izinkan penjualan meski stok sudah nol (e.g. pre-order, konsinyasi).</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
                                        <Checkbox id="is_bundle" checked={data.is_bundle} onCheckedChange={(c) => setData('is_bundle', !!c)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-indigo-600">Jadikan sebagai Produk Bundling / Paket</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Produk ini terdiri dari beberapa barang lain (contoh: Parcel, Promo Bundling). Stok akan mengikuti komponen terkecil.</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
                                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', !!c)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold flex items-center gap-2">
                                                Produk Aktif / Tersedia untuk Dijual
                                                <Badge variant={data.is_active ? 'default' : 'secondary'} className="text-xs">{data.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Produk nonaktif tidak akan muncul di layar kasir POS.</p>
                                        </div>
                                    </label>
                                </div>

                                {data.is_bundle && (
                                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 space-y-4 mt-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold uppercase text-indigo-700 tracking-wide">Komponen Paket</p>
                                            <Button type="button" size="sm" variant="outline" className="h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-100" onClick={() => setData('bundle_items', [...data.bundle_items, { product_id: '', quantity: 1 }])}>
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Barang
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {data.bundle_items.length === 0 && (
                                                <p className="text-xs text-center text-muted-foreground py-2">Belum ada barang di paket ini.</p>
                                            )}
                                            {data.bundle_items.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                        <Select value={item.product_id} onValueChange={(v) => {
                                                            const newItems = [...data.bundle_items];
                                                            newItems[idx].product_id = v;
                                                            setData('bundle_items', newItems);
                                                        }}>
                                                            <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih produk komponen..." /></SelectTrigger>
                                                            <SelectContent>
                                                                {all_products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({formatRupiah(p.base_cost)})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="w-24">
                                                        <Input type="number" min="1" value={item.quantity} className="bg-white" onChange={(e) => {
                                                            const newItems = [...data.bundle_items];
                                                            newItems[idx].quantity = parseInt(e.target.value) || 1;
                                                            setData('bundle_items', newItems);
                                                        }} />
                                                    </div>
                                                    <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => {
                                                        const newItems = [...data.bundle_items];
                                                        newItems.splice(idx, 1);
                                                        setData('bundle_items', newItems);
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {errors.bundle_items && <p className="text-xs text-destructive">{errors.bundle_items}</p>}
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>

                        {/* ── Seksi 4: Gambar Produk (hanya saat edit) ── */}
                        {isEdit && selectedProduct && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <SectionHeader
                                        icon={Images}
                                        title="Gambar Produk"
                                        description="Upload foto produk. Gambar pertama otomatis jadi thumbnail utama."
                                    />
                                    <ProductImageUploader
                                        productId={selectedProduct.id}
                                        images={selectedProduct.images ?? []}
                                    />
                                </div>
                            </>
                        )}

                        {/* Info upload gambar saat create */}
                        {!isEdit && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <SectionHeader
                                        icon={Images}
                                        title="Gambar Produk"
                                        description="Upload foto produk. Gambar pertama otomatis jadi thumbnail utama."
                                    />
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const originalFiles = Array.from(e.target.files);

                                                // Karena proses kompresi asinkron, kita proses sekaligus dengan Promise.all
                                                const compressedFiles = await Promise.all(
                                                    originalFiles.map(file => compressImage(file))
                                                );

                                                // Gabungkan dengan gambar yang sudah dipilih sebelumnya (maksimal 10 gambar)
                                                const newImages = [...data.images, ...compressedFiles].slice(0, 10);
                                                setData('images', newImages);

                                                // Reset nilai input agar bisa memilih file yang sama lagi jika dihapus
                                                e.target.value = '';
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {data.images && data.images.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-2">
                                            {data.images.map((file, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = [...data.images];
                                                                newImages.splice(idx, 1);
                                                                setData('images', newImages);
                                                            }}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-1.5"
                                                            title="Hapus gambar"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {data.imported_image_url && (
                                        <div className="flex flex-col gap-2 pt-2">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Gambar dari Impor URL:</span>
                                            <div className="relative aspect-square w-24 rounded-md overflow-hidden border bg-muted group">
                                                <img src={data.imported_image_url} referrerPolicy="no-referrer" alt="Imported preview" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('imported_image_url', '')}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-1.5"
                                                        title="Hapus gambar impor"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/20">
                        <Button variant="outline" type="button" onClick={closeForm} disabled={processing || isImporting}>Batal</Button>
                        <Button type="submit" disabled={processing || isImporting} className="min-w-[130px]">
                            {processing ? 'Menyimpan...' : isImporting ? 'Mengimpor...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}

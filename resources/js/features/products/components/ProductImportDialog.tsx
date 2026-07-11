import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Upload, X, FileSpreadsheet, Download, AlertCircle, ArrowLeft, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProductImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductImportDialog({ open, onOpenChange }: ProductImportDialogProps) {
    const [step, setStep] = useState<'upload' | 'mapping'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewData, setPreviewData] = useState<{
        new_categories: string[];
        new_types: string[];
        category_examples: Record<string, string[]>;
        type_examples: Record<string, string[]>;
        existing_categories: { id: number; name: string }[];
        existing_types: { id: number; name: string }[];
    } | null>(null);

    const [categoryMapping, setCategoryMapping] = useState<Record<string, string>>({});
    const [typeMapping, setTypeMapping] = useState<Record<string, string>>({});

    const [editingCat, setEditingCat] = useState<Record<string, boolean>>({});
    const [editingType, setEditingType] = useState<Record<string, boolean>>({});

    const hasEmptyField =
        (previewData?.new_categories?.some(cat => (categoryMapping[cat] ?? cat) === '') || false) ||
        (previewData?.new_types?.some(type => (typeMapping[type] ?? type) === '') || false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            setStep('upload');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            setStep('upload');
        }
    };

    const validateFile = (file: File) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];
        if (!validTypes.includes(file.type)) {
            toast.error('Format file tidak didukung', {
                description: 'Silakan unggah file dengan format .xlsx, .xls, atau .csv'
            });
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('File terlalu besar', {
                description: 'Ukuran maksimal file adalah 5MB'
            });
            return false;
        }
        return true;
    };

    const handlePreview = () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        axios.post('/products/import/preview', formData)
            .then(response => {
                const data = response.data;
                if (data.new_categories.length === 0 && data.new_types.length === 0) {
                    // No mapping needed, proceed straight to import
                    executeImport();
                } else {
                    setPreviewData(data);

                    const initialCatMap: Record<string, string> = {};
                    data.new_categories.forEach((c: string) => initialCatMap[c] = c);
                    setCategoryMapping(initialCatMap);

                    const initialTypeMap: Record<string, string> = {};
                    data.new_types.forEach((t: string) => initialTypeMap[t] = t);
                    setTypeMapping(initialTypeMap);

                    setStep('mapping');
                    setIsUploading(false);
                }
            })
            .catch(error => {
                setIsUploading(false);
                toast.error('Gagal Memproses File', {
                    description: error.response?.data?.message || 'Terjadi kesalahan saat membaca file.'
                });
            });
    };

    const executeImport = () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        if (Object.keys(categoryMapping).length > 0) {
            formData.append('category_mapping', JSON.stringify(categoryMapping));
        }
        if (Object.keys(typeMapping).length > 0) {
            formData.append('type_mapping', JSON.stringify(typeMapping));
        }

        router.post('/products/import', formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil!', {
                    description: 'Data produk berhasil diimpor ke dalam sistem.'
                });
                resetState();
                onOpenChange(false);
            },
            onError: (errors) => {
                const rowErrors = Object.keys(errors)
                    .filter(k => k !== 'file')
                    .map(k => errors[k]);

                let description: React.ReactNode = errors.file || 'Terjadi kesalahan saat memproses file.';

                if (rowErrors.length > 0) {
                    description = (
                        <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto">
                            {rowErrors.map((err, idx) => (
                                <span key={idx} className="text-xs text-red-600 leading-tight border-b border-red-100 pb-1 last:border-0">• {err}</span>
                            ))}
                        </div>
                    );
                }

                toast.error('Gagal Mengimpor', {
                    description: description
                });
            },
            onFinish: () => {
                setIsUploading(false);
            }
        });
    };

    const resetState = () => {
        setFile(null);
        setStep('upload');
        setPreviewData(null);
        setCategoryMapping({});
        setTypeMapping({});
        setEditingCat({});
        setEditingType({});
    };

    const handleClose = (open: boolean) => {
        if (!open) resetState();
        onOpenChange(open);
    };

    const downloadTemplate = () => {
        const headers = ['nama_produk', 'kategori', 'tipe_produk', 'stok', 'harga_modal', 'harga_min_jual', 'harga_jual'];
        const csvContent = "\uFEFF" + headers.join(';') + '\n' + 'CONTOH BAJU;Pakaian;Barang;50;50000;90000;100000\n';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Template_Import_Produk.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-650" />
                        {step === 'upload' ? 'Import Produk Massal' : 'Validasi Kategori & Tipe'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {step === 'upload'
                            ? 'Unggah file Excel atau CSV untuk menambahkan ratusan produk sekaligus tanpa harus mengetik manual.'
                            : 'Sistem menemukan kategori/tipe baru. Pastikan ini bukan salah ketik (typo).'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 pr-2 space-y-4">
                    {step === 'upload' ? (
                        <>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 space-y-2 w-full">
                                    <div>
                                        <p className="font-bold">Peraturan Import Data!</p>
                                        <p>Pastikan file Anda memiliki *Header* (Baris ke-1) persis seperti tabel di bawah. <strong className="text-red-600">Nama Produk tidak boleh duplikat</strong>. Nama produk akan otomatis diubah menjadi <strong>HURUF BESAR (UPPERCASE)</strong>.</p>
                                    </div>

                                    <div className="overflow-hidden border border-amber-200 rounded-md bg-white">
                                        <table className="w-full text-left text-[10px]">
                                            <thead className="bg-amber-100 border-b border-amber-200 font-mono">
                                                <tr>
                                                    <th className="p-1.5 border-r border-amber-200">nama_produk</th>
                                                    <th className="p-1.5 border-r border-amber-200">kategori</th>
                                                    <th className="p-1.5 border-r border-amber-200">tipe_produk</th>
                                                    <th className="p-1.5 border-r border-amber-200">stok</th>
                                                    <th className="p-1.5 border-r border-amber-200">harga_modal</th>
                                                    <th className="p-1.5 border-r border-amber-200">harga_min_jual</th>
                                                    <th className="p-1.5">harga_jual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-600 font-mono">
                                                <tr>
                                                    <td className="p-1.5 border-r border-amber-100">BAJU KOKO M</td>
                                                    <td className="p-1.5 border-r border-amber-100">Pakaian</td>
                                                    <td className="p-1.5 border-r border-amber-100">Barang</td>
                                                    <td className="p-1.5 border-r border-amber-100">50</td>
                                                    <td className="p-1.5 border-r border-amber-100">50000</td>
                                                    <td className="p-1.5 border-r border-amber-100">90000</td>
                                                    <td className="p-1.5">100000</td>
                                                </tr>
                                                <tr className="bg-amber-50/30">
                                                    <td className="p-1.5 border-r border-amber-100">CELANA JEANS</td>
                                                    <td className="p-1.5 border-r border-amber-100">Celana</td>
                                                    <td className="p-1.5 border-r border-amber-100">Barang</td>
                                                    <td className="p-1.5 border-r border-amber-100">20</td>
                                                    <td className="p-1.5 border-r border-amber-100">80000</td>
                                                    <td className="p-1.5 border-r border-amber-100">120000</td>
                                                    <td className="p-1.5">150000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <button onClick={downloadTemplate} className="text-indigo-650 font-bold flex items-center gap-1 hover:underline mt-1 bg-white px-2 py-1.5 border border-indigo-200 rounded-md shadow-sm transition-all hover:bg-indigo-50">
                                        <Download className="h-3.5 w-3.5" /> Download Template CSV
                                    </button>
                                </div>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                                    ${file ? 'bg-emerald-50 border-emerald-500 hover:border-emerald-600 hover:bg-emerald-50' : ''}
                                `}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <FileSpreadsheet className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-emerald-800">{file.name}</p>
                                            <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 h-8 mt-2"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
                                            <X className="h-4 w-4 mr-1" /> Hapus File
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">Klik atau tarik file ke sini</p>
                                        <p className="text-xs">Mendukung .xlsx, .xls, .csv (Maks. 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
                                Harap tinjau nama-nama di bawah ini. Anda bisa membuat yang baru, atau <strong>menggabungkannya</strong> dengan yang sudah ada di database.
                            </div>

                            {previewData?.new_categories && previewData.new_categories.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-800 border-b pb-1">Kategori Baru Terdeteksi</h3>
                                    {previewData.new_categories.map((cat) => (
                                        <div key={cat} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-2.5 rounded-lg border gap-3">
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex flex-col mb-1.5">
                                                    <span className="text-[10px] text-indigo-500 italic leading-tight line-clamp-1" title={previewData.category_examples?.[cat]?.join(', ')}>
                                                        {previewData.category_examples?.[cat]?.length ? `${previewData.category_examples[cat].join(', ')}` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {editingCat[cat] ? (
                                                        <div className="flex items-center gap-1 w-full max-w-[200px]">
                                                            <input
                                                                autoFocus
                                                                className={`text-sm border rounded px-2 py-1 w-full outline-none focus:ring-1 ${(categoryMapping[cat] ?? cat) === ''
                                                                    ? 'border-red-500 focus:ring-red-500'
                                                                    : 'border-indigo-300 focus:ring-indigo-500'
                                                                    }`}
                                                                value={categoryMapping[cat] ?? cat}
                                                                onChange={(e) => setCategoryMapping({ ...categoryMapping, [cat]: e.target.value })}
                                                                onKeyDown={(e) => e.key === 'Enter' && (categoryMapping[cat] ?? cat) !== '' && setEditingCat({ ...editingCat, [cat]: false })}
                                                            />
                                                            <button
                                                                onClick={() => (categoryMapping[cat] ?? cat) !== '' && setEditingCat({ ...editingCat, [cat]: false })}
                                                                disabled={(categoryMapping[cat] ?? cat) === ''}
                                                                className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className={`text-sm font-medium truncate max-w-[200px] ${(categoryMapping[cat] ?? cat) === '' ? 'text-red-500 italic' : 'text-slate-700'
                                                                }`}>
                                                                {(categoryMapping[cat] ?? cat) === '' ? '* Wajib diisi' : `"${categoryMapping[cat] ?? cat}"`}
                                                            </span>
                                                            {(!categoryMapping[cat] || isNaN(Number(categoryMapping[cat]))) && (
                                                                <button
                                                                    onClick={() => setEditingCat({ ...editingCat, [cat]: true })}
                                                                    className="text-slate-400 hover:text-indigo-600 p-1 rounded"
                                                                    title="Edit text"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <span className="text-xs text-slate-400">Jadikan:</span>
                                                <select
                                                    className={`text-sm border rounded-md p-1.5 w-full sm:w-[220px] bg-white outline-none focus:ring-1 ${(categoryMapping[cat] ?? cat) === '' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                                                        }`}
                                                    value={categoryMapping[cat] ?? cat}
                                                    onChange={(e) => setCategoryMapping({ ...categoryMapping, [cat]: e.target.value })}
                                                >
                                                    <option value={categoryMapping[cat] ?? cat}>
                                                        {(categoryMapping[cat] ?? cat) === '' ? '+ Buat Baru (...)' : `+ Buat Baru (${categoryMapping[cat] ?? cat})`}
                                                    </option>
                                                    {previewData.existing_categories.length > 0 && (
                                                        <optgroup label="Gabung ke Kategori Yang Ada">
                                                            {previewData.existing_categories.map((ec) => (
                                                                <option key={ec.id} value={ec.id}>{ec.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {previewData?.new_types && previewData.new_types.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-800 border-b pb-1">Tipe Produk Baru Terdeteksi</h3>
                                    {previewData.new_types.map((type) => (
                                        <div key={type} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-2.5 rounded-lg border gap-3">
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex flex-col mb-1.5">
                                                    <span className="text-[10px] text-indigo-500 italic leading-tight line-clamp-1" title={previewData.type_examples?.[type]?.join(', ')}>
                                                        {previewData.type_examples?.[type]?.length ? `${previewData.type_examples[type].join(', ')}` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {editingType[type] ? (
                                                        <div className="flex items-center gap-1 w-full max-w-[200px]">
                                                            <input
                                                                autoFocus
                                                                className={`text-sm border rounded px-2 py-1 w-full outline-none focus:ring-1 ${(typeMapping[type] ?? type) === ''
                                                                    ? 'border-red-500 focus:ring-red-500'
                                                                    : 'border-indigo-300 focus:ring-indigo-500'
                                                                    }`}
                                                                value={typeMapping[type] ?? type}
                                                                onChange={(e) => setTypeMapping({ ...typeMapping, [type]: e.target.value })}
                                                                onKeyDown={(e) => e.key === 'Enter' && (typeMapping[type] ?? type) !== '' && setEditingType({ ...editingType, [type]: false })}
                                                            />
                                                            <button
                                                                onClick={() => (typeMapping[type] ?? type) !== '' && setEditingType({ ...editingType, [type]: false })}
                                                                disabled={(typeMapping[type] ?? type) === ''}
                                                                className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className={`text-sm font-medium truncate max-w-[200px] ${(typeMapping[type] ?? type) === '' ? 'text-red-500 italic' : 'text-slate-700'
                                                                }`}>
                                                                {(typeMapping[type] ?? type) === '' ? '* Wajib diisi' : `"${typeMapping[type] ?? type}"`}
                                                            </span>
                                                            {(!typeMapping[type] || isNaN(Number(typeMapping[type]))) && (
                                                                <button
                                                                    onClick={() => setEditingType({ ...editingType, [type]: true })}
                                                                    className="text-slate-400 hover:text-indigo-600 p-1 rounded"
                                                                    title="Edit text"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <span className="text-xs text-slate-400">Jadikan:</span>
                                                <select
                                                    className={`text-sm border rounded-md p-1.5 w-full sm:w-[220px] bg-white outline-none focus:ring-1 ${(typeMapping[type] ?? type) === '' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                                                        }`}
                                                    value={typeMapping[type] ?? type}
                                                    onChange={(e) => setTypeMapping({ ...typeMapping, [type]: e.target.value })}
                                                >
                                                    <option value={typeMapping[type] ?? type}>
                                                        {(typeMapping[type] ?? type) === '' ? '+ Buat Baru (...)' : `+ Buat Baru (${typeMapping[type] ?? type})`}
                                                    </option>
                                                    {previewData.existing_types.length > 0 && (
                                                        <optgroup label="Gabung ke Tipe Yang Ada">
                                                            {previewData.existing_types.map((et) => (
                                                                <option key={et.id} value={et.id}>{et.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between gap-2 pt-4 border-t shrink-0">
                    {step === 'mapping' ? (
                        <Button variant="outline" onClick={() => setStep('upload')} disabled={isUploading}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                        </Button>
                    ) : (
                        <div></div>
                    )}

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleClose(false)} disabled={isUploading}>
                            Batal
                        </Button>
                        {step === 'upload' ? (
                            <Button
                                onClick={handlePreview}
                                disabled={!file || isUploading}
                                className="bg-slate-900 hover:bg-slate-950 text-white font-bold"
                            >
                                {isUploading ? 'Memproses...' : 'Lanjut Preview'}
                            </Button>
                        ) : (
                            <Button
                                onClick={executeImport}
                                disabled={!file || isUploading || hasEmptyField}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {isUploading ? 'Mengimpor...' : 'Konfirmasi & Simpan'}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

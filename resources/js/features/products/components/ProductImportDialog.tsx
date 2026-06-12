import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Upload, X, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
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

    const handleUpload = () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post('/products/import', formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil!', {
                    description: 'Data produk berhasil diimpor ke dalam sistem.'
                });
                setFile(null);
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error('Gagal Mengimpor', {
                    description: errors.file || 'Terjadi kesalahan saat memproses file.'
                });
            },
            onFinish: () => {
                setIsUploading(false);
            }
        });
    };

    const downloadTemplate = () => {
        const headers = ['nama_produk', 'sku', 'kategori', 'harga_modal', 'harga_jual'];
        const csvContent = "\uFEFF" + headers.join(';') + '\n' + 'Contoh Baju;SKU-001;Pakaian;50000;100000\n';
        
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-650" />
                        Import Produk Massal
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Unggah file Excel atau CSV untuk menambahkan ratusan produk sekaligus tanpa harus mengetik manual.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 space-y-1">
                            <p className="font-bold">Pastikan format file Anda benar!</p>
                            <p>Kolom yang wajib ada: <span className="font-mono bg-amber-100 px-1 rounded">nama_produk</span>, <span className="font-mono bg-amber-100 px-1 rounded">sku</span>, <span className="font-mono bg-amber-100 px-1 rounded">kategori</span>, <span className="font-mono bg-amber-100 px-1 rounded">harga_modal</span>, <span className="font-mono bg-amber-100 px-1 rounded">harga_jual</span>.</p>
                            <button onClick={downloadTemplate} className="text-indigo-650 font-bold flex items-center gap-1 hover:underline mt-1">
                                <Download className="h-3 w-3" /> Download Template CSV
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
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        Batal
                    </Button>
                    <Button 
                        onClick={handleUpload} 
                        disabled={!file || isUploading}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold"
                    >
                        {isUploading ? 'Memproses...' : 'Mulai Import'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

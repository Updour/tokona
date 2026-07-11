import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Upload, X, FileSpreadsheet, Download, AlertCircle, ArrowLeft, Check, PackageCheck } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OpnameImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OpnameImportDialog({ open, onOpenChange }: OpnameImportDialogProps) {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [opnameDate, setOpnameDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const [previewData, setPreviewData] = useState<{
        valid_items: any[];
        invalid_items: any[];
        total_processed: number;
    } | null>(null);

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

        axios.post('/inventory/opname/import-preview', formData)
            .then(({ data }) => {
                setPreviewData(data);
                setStep('preview');
            })
            .catch((err) => {
                const errors = err.response?.data?.errors;
                if (errors) {
                    const rowErrors = Object.keys(errors)
                        .filter(k => k.startsWith('row_'))
                        .map(k => errors[k]);

                    let description: React.ReactNode = errors.file || 'Terjadi kesalahan saat memproses file.';

                    if (rowErrors.length > 0) {
                        description = (
                            <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto">
                                {rowErrors.map((e: any, i: number) => <span key={i}>• {e}</span>)}
                            </div>
                        );
                    }

                    toast.error('Validasi Gagal', { description });
                } else {
                    toast.error('Gagal memproses file', {
                        description: err.response?.data?.message || 'Pastikan format file sesuai dengan template.'
                    });
                }
            })
            .finally(() => {
                setIsUploading(false);
            });
    };

    const executeImport = () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('opname_date', opnameDate);
        if (notes) {
            formData.append('notes', notes);
        }

        router.post('/inventory/opname/import', formData, {
            onSuccess: () => {
                onOpenChange(false);
                resetState();
            },
            onError: (errors) => {
                toast.error('Gagal Import', {
                    description: errors.file || errors.opname_date || 'Terjadi kesalahan saat menyimpan data.'
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setOpnameDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    const downloadTemplate = () => {
        window.location.href = '/inventory/opname/download-template';
    };

    const handleClose = (newOpen: boolean) => {
        if (!newOpen) {
            resetState();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl p-0 overflow-hidden bg-slate-50">
                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            {step === 'upload' ? 'Import Stock Opname' : 'Preview Import'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {step === 'upload'
                                ? 'Unggah file Excel (Template) yang sudah Anda isi stok fisiknya.'
                                : 'Periksa kembali data yang akan di-opname.'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                                        Langkah 1: Download Template
                                    </h3>
                                    <p className="text-xs text-slate-600">
                                        Unduh template Excel yang sudah berisi semua produk Anda beserta stok sistemnya saat ini.
                                    </p>
                                    <Button onClick={downloadTemplate} variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/10">
                                        <Download className="mr-2 h-4 w-4" /> Download Template Excel
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                                    Langkah 2: Upload File
                                </h3>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`
                                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                                        ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'}
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`p-3 rounded-full ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {file ? <FileSpreadsheet className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700">
                                                {file ? file.name : 'Klik atau drag file ke sini'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Format didukung: .xlsx, .xls, .csv (Max 5MB)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {file && (
                                    <Button
                                        onClick={handlePreview}
                                        disabled={isUploading}
                                        className="w-full mt-4"
                                    >
                                        {isUploading ? 'Memproses...' : 'Lanjut ke Preview'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'preview' && previewData && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border p-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tanggal Opname</Label>
                                        <Input 
                                            type="date" 
                                            value={opnameDate} 
                                            onChange={(e) => setOpnameDate(e.target.value)} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Catatan / Keterangan</Label>
                                        <Input 
                                            placeholder="Contoh: Audit akhir bulan" 
                                            value={notes} 
                                            onChange={(e) => setNotes(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                                    <div className="flex-1 text-center border-r">
                                        <p className="text-xs text-slate-500 font-medium">Item Valid</p>
                                        <p className="text-2xl font-black text-emerald-600">{previewData.valid_items.length}</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-slate-500 font-medium">Item Error</p>
                                        <p className="text-2xl font-black text-rose-600">{previewData.invalid_items.length}</p>
                                    </div>
                                </div>
                            </div>

                            {previewData.invalid_items.length > 0 && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4" /> Ada {previewData.invalid_items.length} baris bermasalah!
                                    </h4>
                                    <ul className="text-xs text-rose-700 space-y-1 max-h-32 overflow-y-auto list-disc list-inside">
                                        {previewData.invalid_items.map((item, idx) => (
                                            <li key={idx}>
                                                Baris {item.row}: {item.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep('upload')}
                                    disabled={isUploading}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={executeImport}
                                    disabled={isUploading || previewData.valid_items.length === 0}
                                >
                                    <PackageCheck className="w-4 h-4 mr-2" /> 
                                    {isUploading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { useForm } from '@inertiajs/react';
import { Search, Plus, Trash2, Package2, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OpnameDialogProps {
    isOpen: boolean;
    onClose: () => void;
    products: any[];
}

export default function OpnameDialog({ isOpen, onClose, products }: OpnameDialogProps) {
    const [search, setSearch] = useState('');
    
    const { data, setData, post, processing, reset, errors } = useForm({
        opname_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [] as any[]
    });

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const addItem = (product: any) => {
        if (data.items.find(i => i.product_id === product.id)) {
            toast.error('Produk sudah ada di daftar opname');

            return;
        }

        setData('items', [
            ...data.items, 
            {
                product_id: product.id,
                name: product.name,
                sku: product.sku,
                system_stock: product.current_stock || 0,
                physical_stock: product.current_stock || 0,
                reason: ''
            }
        ]);
        setSearch(''); // Reset search
    };

    const updateItem = (productId: string, field: string, value: any) => {
        setData('items', data.items.map(item => 
            item.product_id === productId ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (productId: string) => {
        setData('items', data.items.filter(i => i.product_id !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            toast.error('Tambahkan minimal 1 produk untuk diopname.');

            return;
        }

        post('/inventory/opname', {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-5 border-b bg-slate-50 shrink-0">
                    <DialogTitle className="text-xl font-black text-slate-800">Catat Stock Opname</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Product Picker */}
                    <div className="w-full lg:w-[300px] border-r flex flex-col bg-white">
                        <div className="p-3 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Cari produk..." 
                                    className="pl-9 h-9 text-xs"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="p-2 border-b last:border-0 hover:bg-slate-50 flex justify-between items-center group cursor-pointer" onClick={() => addItem(p)}>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                        <p className="text-[10px] text-slate-500">Sistem: <strong className="text-indigo-600">{p.current_stock || 0}</strong></p>
                                    </div>
                                    <button className="h-6 w-6 rounded bg-slate-100 text-slate-500 group-hover:bg-indigo-650 group-hover:text-white flex items-center justify-center transition-colors">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Opname Form */}
                    <div className="flex-1 flex flex-col bg-slate-50">
                        <div className="p-4 border-b bg-white grid grid-cols-2 gap-4 shrink-0">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Opname</label>
                                <Input 
                                    type="date" 
                                    className="h-9"
                                    value={data.opname_date}
                                    onChange={e => setData('opname_date', e.target.value)}
                                />
                                {errors.opname_date && <span className="text-[10px] text-rose-500">{errors.opname_date}</span>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                                <Input 
                                    placeholder="Opsional..." 
                                    className="h-9"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {data.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Package2 className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-sm font-semibold">Belum ada item ditambahkan</p>
                                    <p className="text-xs">Cari dan pilih produk dari panel kiri</p>
                                </div>
                            ) : (
                                data.items.map((item, idx) => {
                                    const diff = item.physical_stock - item.system_stock;

                                    return (
                                        <div key={item.product_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                            <button onClick={() => removeItem(item.product_id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            
                                            <div className="mb-3 pr-6">
                                                <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                                                <p className="text-[10px] text-slate-500">{item.sku}</p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 items-end">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Stok Sistem</label>
                                                    <div className="h-9 bg-slate-100 rounded-lg flex items-center px-3 text-sm font-semibold text-slate-600">
                                                        {item.system_stock}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Stok Fisik</label>
                                                    <Input 
                                                        type="number"
                                                        min="0"
                                                        className="h-9 font-bold"
                                                        value={item.physical_stock}
                                                        onChange={e => updateItem(item.product_id, 'physical_stock', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Selisih</label>
                                                    <div className={`h-9 border rounded-lg flex items-center justify-between px-3 text-sm font-bold ${
                                                        diff === 0 ? 'bg-slate-50 text-slate-500 border-slate-200' : 
                                                        diff > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                        'bg-rose-50 text-rose-600 border-rose-200'
                                                    }`}>
                                                        <span>{diff > 0 ? '+' : ''}{diff}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {diff !== 0 && (
                                                <div className="mt-3">
                                                    <Input 
                                                        placeholder="Alasan selisih (Wajib diisi jika ada selisih)" 
                                                        className="h-8 text-xs border-dashed"
                                                        value={item.reason}
                                                        onChange={e => updateItem(item.product_id, 'reason', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50 shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={processing}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={processing || data.items.length === 0} className="bg-indigo-650 hover:bg-indigo-700">
                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Penyesuaian
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

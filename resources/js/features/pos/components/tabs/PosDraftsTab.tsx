import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Trash2, Search, X, Bookmark } from 'lucide-react';
import { formatRupiah } from '@/lib/helpers/format';

interface PosDraftsTabProps {
    drafts: any[];
    handleDeleteDraft: (id: string) => void;
    handleLoadDraft: (draft: any) => void;
}

export function PosDraftsTab({ drafts, handleDeleteDraft, handleLoadDraft }: PosDraftsTabProps) {
    const [search, setSearch] = useState('');

    const filteredDrafts = useMemo(() => {
        return drafts.filter((dr: any) => {
            const matchesSearch =
                dr.notes.toLowerCase().includes(search.toLowerCase()) ||
                dr.items.some((it: any) => it.name.toLowerCase().includes(search.toLowerCase()));
            return matchesSearch;
        });
    }, [drafts, search]);

    return (
        <div className="space-y-4 h-full flex flex-col overflow-hidden">
            {/* Pencarian Draft (Desain mirip katalog produk) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-3 rounded-xl border shadow-sm shrink-0">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama draft atau produk..."
                        className="pl-9 h-10 border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-655">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-650">
                        {filteredDrafts.length} Draft Tersimpan
                    </div>
                </div>
            </div>

            {/* Grid Katalog Drafts (Desain mirip grid katalog produk POS) */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 auto-rows-max gap-4 min-h-0">
                {filteredDrafts.length === 0 ? (
                    <div className="col-span-full flex flex-col justify-center items-center py-20 text-slate-400 bg-white rounded-2xl border">
                        <FolderOpen className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
                        <span className="text-sm font-medium">Draft tidak ditemukan.</span>
                    </div>
                ) : (
                    filteredDrafts.map((dr: any) => {
                        const totalAmount = dr.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
                        const totalQty = dr.items.reduce((sum: number, i: any) => sum + i.qty, 0);
                        const itemsSummary = dr.items.map((it: any) => `${it.name} (x${it.qty})`).join(', ');
                        const firstItemWithImage = dr.items.find((it: any) => it.image);
                        const draftImage = firstItemWithImage ? firstItemWithImage.image : null;

                        return (
                            <div
                                key={dr.id}
                                className="group relative flex flex-col bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-amber-400 h-fit"
                            >
                                {/* Foto / Visual Ringan (Header Draft Card) */}
                                <div className="h-48 bg-slate-50/50 flex items-center justify-center border-b relative p-2 overflow-hidden shrink-0">
                                    {draftImage ? (
                                        <img
                                            src={draftImage}
                                            alt={dr.notes || 'Draft'}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500 group-hover:scale-105 transition-transform duration-300">
                                            <Bookmark className="h-6 w-6 fill-amber-100" />
                                        </div>
                                    )}

                                    {/* Tag Qty Item (Pojok kanan atas seperti Tag Stok Produk) */}
                                    <Badge className="absolute top-1.5 right-1.5 border-0 text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-500 hover:bg-emerald-500 text-white">
                                        {totalQty} Item
                                    </Badge>
                                </div>

                                {/* Info Draft Card */}
                                <div className="p-2.5 flex flex-col gap-1.5">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                                            {new Date(dr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(dr.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <h3 className="text-xs font-black text-slate-800 line-clamp-1 mt-0.5 group-hover:text-amber-600 transition-colors">
                                            {dr.notes || 'Tanpa Catatan'}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-medium leading-relaxed" title={itemsSummary}>
                                            {itemsSummary}
                                        </p>
                                    </div>

                                    {/* Bottom Area: Total Belanja & Tombol Aksi */}
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 shrink-0">
                                        <span className="text-xs font-black text-indigo-650 font-mono">
                                            {formatRupiah(totalAmount)}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                onClick={() => handleDeleteDraft(dr.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0"
                                                title="Hapus Draft"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleLoadDraft(dr)}
                                                size="sm"
                                                className="h-7 px-2.5 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black rounded-lg gap-1 shadow-sm shrink-0"
                                            >
                                                <FolderOpen className="h-3 w-3" />
                                                Buka
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

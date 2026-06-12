import { Edit, Trash2, GripVertical } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useMenuStore } from '@/pages/superadmin/Menus/stores/useMenuStore';

export function MenuTable({ flatMenus }: { flatMenus: any[] }) {
    const { openForm, openDelete } = useMenuStore();
    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 border-b p-4">
                <h3 className="text-sm font-semibold">Struktur Sidebar Menu</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Label Menu</TableHead>
                        <TableHead>Link URL (href)</TableHead>
                        <TableHead>Permission (Hak Akses)</TableHead>
                        <TableHead className="w-[100px] text-center">Urutan</TableHead>
                        <TableHead className="w-[120px] text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flatMenus.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Belum ada menu yang dikonfigurasi.</TableCell>
                        </TableRow>
                    ) : (
                        flatMenus.map((m) => (
                            <TableRow key={m.id} className={m.is_child ? "bg-slate-50/30" : "font-medium"}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {m.is_child ? (
                                            <div className="ml-6 flex items-center gap-2 text-slate-500">
                                                <div className="w-3 h-3 border-l-2 border-b-2 rounded-bl-sm border-slate-300"></div>
                                                <span className="text-sm">{m.title}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-800">
                                                <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                                <span className="text-sm font-bold">{m.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-indigo-600">{m.href || '-'}</TableCell>
                                <TableCell>
                                    {m.permission_key ? (
                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                            {m.permission_key}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">Publik (Tanpa Syarat)</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{m.order}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openForm(m)} className="h-8 w-8 text-blue-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDelete(m)} className="h-8 w-8 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

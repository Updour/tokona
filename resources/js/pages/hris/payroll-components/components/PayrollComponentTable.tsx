import { formatRupiah } from '@/lib/helpers/format';
import { Edit, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePayrollComponentStore } from '../stores/usePayrollComponentStore';

export default function PayrollComponentTable({ components }: any) {
    const { openForm, openDelete } = usePayrollComponentStore();

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="font-semibold py-4 pl-6">Nama Komponen</TableHead>
                        <TableHead className="font-semibold py-4">Tipe</TableHead>
                        <TableHead className="font-semibold py-4 text-right">Nominal Default</TableHead>
                        <TableHead className="font-semibold py-4 text-center">Status Pajak</TableHead>
                        <TableHead className="font-semibold py-4 text-right pr-6">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-card">
                    {components?.data?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                Belum ada komponen gaji yang ditambahkan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        components?.data?.map((comp: any) => (
                            <TableRow key={comp.id} className="hover:bg-muted/30 transition-colors group">
                                <TableCell className="pl-6 font-medium">{comp.name}</TableCell>
                                <TableCell>
                                    {comp.type === 'allowance' ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 flex w-fit items-center gap-1">
                                            <PlusCircle className="w-3 h-3" /> Tunjangan
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-0 flex w-fit items-center gap-1">
                                            <MinusCircle className="w-3 h-3" /> Potongan
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatRupiah(comp.amount)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {comp.is_taxable ? (
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Kena Pajak</span>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-400">Tidak Kena Pajak</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => openForm(comp)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDelete(comp)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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

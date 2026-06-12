import { formatRupiah } from '@/lib/helpers/format';
import React from 'react';
import { Wallet, CheckCircle2, AlertCircle, MoreHorizontal, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { useSalaryStore } from '../stores/useSalaryStore';

interface Props {
    employees: any;
}

export default function SalariesTable({ employees }: Props) {
    const { openSetSalary } = useSalaryStore();
    return (
        <>
            <div className="rounded-md border overflow-hidden mt-2">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold py-4">Karyawan</TableHead>
                            <TableHead className="font-semibold py-4">Posisi / Cabang</TableHead>
                            <TableHead className="font-semibold py-4">Status Gaji</TableHead>
                            <TableHead className="font-semibold py-4 text-right">Gaji Pokok</TableHead>
                            <TableHead className="font-semibold py-4 text-right w-[80px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-card">
                        {employees?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                    Tidak ada data karyawan yang cocok dengan filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees?.data?.map((employee: any) => (
                                <TableRow key={employee.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border border-primary/20">
                                                {employee.avatar ? (
                                                    <img src={`/storage/${employee.avatar}`} alt={employee.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    employee.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary">{employee.name}</p>
                                                <p className="text-xs text-muted-foreground">{employee.email}</p>
                                                {employee.employment_status && (
                                                    <Badge variant="outline" className="text-[10px] mt-1 h-5 px-1.5 font-medium">
                                                        {employee.employment_status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {employee.branch ? (
                                            <Badge variant="outline" className="font-normal text-xs">{employee.branch.name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Pusat</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {employee.employee_salary ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 flex w-fit items-center gap-1 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <CheckCircle2 className="w-3 h-3"/> Sudah Diatur
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0 flex w-fit items-center gap-1 dark:bg-red-900/30 dark:text-red-400">
                                                <AlertCircle className="w-3 h-3"/> Belum Diatur
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-slate-700 dark:text-slate-200">
                                        {employee.employee_salary ? formatRupiah(employee.employee_salary.basic_salary) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50">
                                                    <span className="sr-only">Buka menu aksi</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px]">
                                                <DropdownMenuItem onClick={() => openSetSalary(employee)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Atur Gaji Pokok
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination */}
            {employees?.data?.length > 0 && employees.links && (
                <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan <span className="font-medium text-foreground">{employees.from}</span> - <span className="font-medium text-foreground">{employees.to}</span> dari <span className="font-medium text-foreground">{employees.total}</span> data
                    </div>
                    <div className="flex gap-1">
                        {employees.links.map((link: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`inline-flex items-center justify-center rounded-md h-8 min-w-8 px-3 text-xs font-medium transition-colors border
                                    ${link.active 
                                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                                        : 'bg-background hover:bg-muted'}
                                    ${!link.url ? 'opacity-50 cursor-not-allowed border-transparent' : ''}
                                `}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

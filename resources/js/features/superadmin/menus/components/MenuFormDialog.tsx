import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MenuFormDialog({
    isOpen,
    onClose,
    data,
    setData,
    onSubmit,
    errors,
    processing,
    menus,
    permissions,
    isEdit
}: any) {
    const [isManualPermission, setIsManualPermission] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
                    <DialogDescription>
                        Atur label, rute (URL), dan batasan akses (permission) untuk menu ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Label Menu <span className="text-red-500">*</span></Label>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Misal: Laporan Penjualan" required />
                        {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Tautan (URL Href)</Label>
                        <Input value={data.href} onChange={e => setData('href', e.target.value)} placeholder="Misal: /reports?tab=sales atau #" className="font-mono text-sm" />
                        {errors.href && <span className="text-xs text-red-500">{errors.href}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Urutan Tampil <span className="text-red-500">*</span></Label>
                            <Input type="number" min="1" value={data.order} onChange={e => setData('order', parseInt(e.target.value) || 1)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Nama Icon (opsional)</Label>
                            <Input value={data.icon} onChange={e => setData('icon', e.target.value)} placeholder="Misal: PieChart" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Menu Induk (Parent)</Label>
                        <Select value={data.parent_id || '__none__'} onValueChange={v => setData('parent_id', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Induk (opsional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__" className="font-semibold text-primary">Tidak Ada (Jadikan Menu Utama)</SelectItem>
                                {menus.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Syarat Hak Akses (Permission)</Label>
                            <Button 
                                type="button" 
                                variant="link" 
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" 
                                onClick={() => setIsManualPermission(!isManualPermission)}
                            >
                                {isManualPermission ? 'Pilih dari Daftar' : 'Input Manual (Custom)'}
                            </Button>
                        </div>
                        {isManualPermission ? (
                            <Input 
                                value={data.permission_key === '__none__' ? '' : data.permission_key} 
                                onChange={e => setData('permission_key', e.target.value)} 
                                placeholder="Ketik manual, misal: consignments.index" 
                                className="font-mono text-sm"
                            />
                        ) : (
                            <Select value={data.permission_key || '__none__'} onValueChange={v => setData('permission_key', v)}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Pilih Permission (opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__" className="font-semibold text-primary">Akses Publik (Tanpa Batasan)</SelectItem>
                                    {Object.entries(permissions).map(([module, perms]: any) => (
                                        <React.Fragment key={module}>
                                            <div className="px-2 py-1.5 text-xs font-bold text-slate-500 bg-slate-50 uppercase tracking-wider">{module}</div>
                                            {perms.map((p: any) => (
                                                <SelectItem key={p.key} value={p.key} className="pl-4">
                                                    {p.name} <span className="text-xs text-muted-foreground">({p.key})</span>
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.permission_key && <span className="text-xs text-red-500 mt-1">{errors.permission_key}</span>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEdit ? 'Menyimpan Perubahan...' : 'Menyimpan...') : (isEdit ? 'Simpan Perubahan' : 'Tambah Menu')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

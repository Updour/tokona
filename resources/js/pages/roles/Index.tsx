import { Head, useForm, usePage } from '@inertiajs/react';
import { Shield, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/layouts/app/app-main-layout';
import type { Permission, Role } from '@/pages/roles/types';
import { useRoleStore } from '@/pages/roles/stores/useRoleStore';

interface PageProps {
    roles: Role[];
    permissionsGrouped: Record<string, Permission[]>;
    [key: string]: any;
}

export default function Index() {
    const { props } = usePage<any>();
    const { roles = [], permissionsGrouped = {} } = props as PageProps;

    const { selectedRole, setSelectedRole, isCreateOpen, openCreate, closeCreate } = useRoleStore();

    useEffect(() => {
        if (!selectedRole && roles.length > 0) {
            setSelectedRole(roles[0]);
        }
    }, [roles]);

    // Form for creating a new role
    const createForm = useForm({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    // Form for editing the selected role's permissions
    const editForm = useForm({
        description: selectedRole?.description || '',
        permissions: selectedRole?.permissions.map(p => p.id) || [] as string[],
    });

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        editForm.setData({
            description: role.description || '',
            permissions: role.permissions.map(p => p.id),
        });
    };

    const handlePermissionToggle = (permissionId: string) => {
        const current = [...editForm.data.permissions];
        const index = current.indexOf(permissionId);

        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permissionId);
        }

        editForm.setData('permissions', current);
    };

    const handleSelectAllInModule = (permissionIds: string[], checked: boolean) => {
        let current = [...editForm.data.permissions];

        if (checked) {
            // Add all missing ids
            permissionIds.forEach(id => {
                if (!current.includes(id)) {
current.push(id);
}
            });
        } else {
            // Remove all ids
            current = current.filter(id => !permissionIds.includes(id));
        }

        editForm.setData('permissions', current);
    };

    const handleSavePermissions = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
return;
}

        editForm.put(`/roles/${selectedRole.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Hak akses role berhasil disimpan!');
                // Update selected role state with new loaded data
                const updated = roles.find(r => r.id === selectedRole.id);

                if (updated) {
                    setSelectedRole(updated);
                }
            },
            onError: () => {
                toast.error('Gagal menyimpan hak akses.');
            }
        });
    };

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/roles', {
            onSuccess: () => {
                toast.success('Role baru berhasil dibuat!');
                closeCreate();
                createForm.reset();

                if (roles.length > 0) {
                    setSelectedRole(roles[roles.length - 1]);
                }
            },
            onError: (errors) => {
                const msg = Object.values(errors).join(', ');
                toast.error(`Gagal: ${msg}`);
            }
        });
    };

    const handleDeleteRole = (role: Role) => {
        if (['super-admin', 'owner'].includes(role.name)) {
            toast.error('Role bawaan sistem tidak boleh dihapus.');

            return;
        }

        toast(`Hapus role "${role.name}"? Karyawan dengan role ini akan kehilangan akses.`, {
            action: {
                label: 'Ya, Hapus',
                onClick: () => {
                    editForm.delete(`/roles/${role.id}`, {
                        onSuccess: () => {
                            toast.success('Role berhasil dihapus.');
                            setSelectedRole(roles[0] || null);
                        }
                    });
                }
            },
            cancel: { label: 'Batal', onClick: () => {} }
        });
    };

    const getRoleBadgeVariant = (name: string) => {
        switch (name) {
            case 'super-admin': return 'destructive';
            case 'owner': return 'default';
            case 'admin': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <MainLayout>
            <Head title="Manajemen Role & Hak Akses" />

            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Role & Hak Akses Karyawan</h1>
                <p className="text-sm text-muted-foreground">
                    Atur wewenang setiap divisi karyawan toko Anda untuk melindungi data sensitif keuangan dan produk.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* KIRI: Daftar Roles */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="border border-slate-200/80 shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold">Daftar Peran</CardTitle>
                                <CardDescription className="text-xs">Pilih peran untuk mengatur hak akses.</CardDescription>
                            </div>
                            <Button size="sm" onClick={openCreate} className="h-8 text-xs gap-1">
                                <Plus className="h-3.5 w-3.5" /> Tambah
                            </Button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role)}
                                    className={`flex flex-col p-3 rounded-lg cursor-pointer transition-all border ${
                                        selectedRole?.id === role.id
                                            ? 'bg-slate-50 border-slate-300 shadow-sm'
                                            : 'border-transparent hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs capitalize text-slate-800 flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5 text-slate-500" />
                                            {role.name}
                                        </span>
                                        <Badge variant={getRoleBadgeVariant(role.name)} className="text-[10px] px-1.5 py-0">
                                            {role.permissions?.length || 0} Akses
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                                        {role.description || 'Tidak ada deskripsi.'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* KANAN: Matriks Permissions */}
                <div className="lg:col-span-8">
                    {selectedRole ? (
                        <Card className="border border-slate-200/80 shadow-sm">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-slate-50/30">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-sm font-bold capitalize flex items-center gap-1.5 text-slate-800">
                                            <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
                                            Hak Akses Peran: {selectedRole.name}
                                        </CardTitle>
                                        {['super-admin', 'owner'].includes(selectedRole.name) && (
                                            <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50 border-amber-200">
                                                Role Sistem
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        {selectedRole.description || 'Kelola hak akses untuk peran ini.'}
                                    </CardDescription>
                                </div>
                                {!['super-admin', 'owner'].includes(selectedRole.name) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteRole(selectedRole)}
                                        className="h-8 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive gap-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Hapus Peran
                                    </Button>
                                )}
                            </CardHeader>
                            <form onSubmit={handleSavePermissions}>
                                <CardContent className="pt-4 space-y-6">
                                    {/* Deskripsi Role */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-desc" className="text-[11px] font-semibold uppercase text-muted-foreground">Deskripsi Peran</Label>
                                        <Textarea
                                            id="edit-desc"
                                            value={editForm.data.description}
                                            onChange={(e) => editForm.setData('description', e.target.value)}
                                            placeholder="Tulis kegunaan peran ini..."
                                            className="text-xs min-h-[60px]"
                                            disabled={['super-admin', 'owner'].includes(selectedRole.name)}
                                        />
                                    </div>

                                    {/* Permission Modules */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 pb-1 border-b">
                                            Matriks Konfigurasi Fitur
                                        </h3>

                                        {Object.entries(permissionsGrouped).map(([module, items]) => {
                                            const allIds = items.map(i => i.id);
                                            const allSelected = allIds.every(id => editForm.data.permissions.includes(id));
                                            const isSystemRole = ['super-admin', 'owner'].includes(selectedRole.name);

                                            return (
                                                <div key={module} className="rounded-lg border bg-white overflow-hidden">
                                                    <div className="bg-slate-50/50 px-4 py-2 border-b flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-700">{module}</span>
                                                        {!isSystemRole && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Label htmlFor={`select-all-${module}`} className="text-[10px] text-muted-foreground cursor-pointer">Pilih Semua</Label>
                                                                <Checkbox
                                                                    id={`select-all-${module}`}
                                                                    checked={allSelected}
                                                                    onCheckedChange={(checked) => handleSelectAllInModule(allIds, !!checked)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {items.map((perm) => {
                                                            const isChecked = editForm.data.permissions.includes(perm.id) || isSystemRole;

                                                            return (
                                                                <div
                                                                    key={perm.id}
                                                                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50/30 border border-slate-100"
                                                                >
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-xs font-semibold text-slate-800">{perm.name}</span>
                                                                        <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                                                                    </div>
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        disabled={isSystemRole}
                                                                        onCheckedChange={() => handlePermissionToggle(perm.id)}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t py-3 bg-slate-50/40 flex justify-between">
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        Perubahan hak akses berdampak langsung pada login aktif karyawan.
                                    </div>
                                    {!['super-admin', 'owner'].includes(selectedRole.name) && (
                                        <Button type="submit" disabled={editForm.processing} size="sm" className="gap-1.5 h-8 text-xs">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Simpan Hak Akses
                                        </Button>
                                    )}
                                </CardFooter>
                            </form>
                        </Card>
                    ) : (
                        <div className="h-48 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                            Belum ada peran terpilih. Tambah peran baru untuk memulai.
                        </div>
                    )}
                </div>
            </div>

            {/* DIALOG: Buat Role Baru */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateRole}>
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold">Buat Peran Baru</DialogTitle>
                            <DialogDescription className="text-xs">
                                Daftarkan divisi karyawan baru dan batasi hak aksesnya secara dinamis.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs">Nama Peran / Divisi</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: staff-gudang, supervisor"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Format nama akan diubah otomatis menjadi slug huruf kecil tanpa spasi.</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="desc" className="text-xs">Deskripsi Singkat</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Contoh: Bertugas mengelola keluar masuk barang di gudang."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={closeCreate} className="text-xs h-8">
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} size="sm" className="text-xs h-8">
                                Buat Peran
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

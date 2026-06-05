import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeStore } from '@/pages/employees/stores/useEmployeeStore';
import { store as employeesStore, update as employeesUpdate } from '@/routes/employees';

interface EmployeeFormDialogProps {
    branches: any[];
    roles: any[];
    tenants?: any[];
}

export function EmployeeFormDialog({ branches, roles, tenants = [] }: EmployeeFormDialogProps) {
    const { isFormOpen, selectedEmployee, closeForm } = useEmployeeStore();
    const { auth } = usePage().props as any;

    // Check if the current employee is a Super Admin
    const isSuperAdmin = auth?.employee?.roles?.some((r: any) => r.name === 'super-admin') || auth?.employee?.tenant_id === null;

    const [selectedTenantId, setSelectedTenantId] = useState<string>('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        status: 'active',
        branch_id: '',
        role_id: '',
        tenant_id: '',
    });

    // Populate form data on edit
    useEffect(() => {
        if (selectedEmployee) {
            setData({
                name: selectedEmployee.name,
                email: selectedEmployee.email,
                password: '', // Leave empty on edit unless changing
                phone: selectedEmployee.phone || '',
                status: selectedEmployee.status,
                branch_id: selectedEmployee.branch_id || '',
                role_id: selectedEmployee.roles?.[0]?.id || '',
                tenant_id: selectedEmployee.tenant_id || '',
            });
            setSelectedTenantId(selectedEmployee.tenant_id || '');
        } else {
            reset();
            setSelectedTenantId('');
        }

        clearErrors();
    }, [selectedEmployee, isFormOpen]);

    // Handle tenant selection change to filter branches
    const handleTenantChange = (tenantId: string) => {
        setSelectedTenantId(tenantId);
        setData((prev) => ({
            ...prev,
            tenant_id: tenantId,
            branch_id: '', // Reset branch when tenant changes
        }));
    };

    // Filter branches dynamically based on selected tenant (for Super Admin)
    const filteredBranches = isSuperAdmin && selectedTenantId
        ? branches.filter((b) => b.tenant_id === selectedTenantId)
        : isSuperAdmin
            ? [] // Don't show branches until tenant is chosen
            : branches;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedEmployee) {
            put(employeesUpdate(selectedEmployee.id).url, {
                onSuccess: () => {
                    closeForm();
                },
            });
        } else {
            post(employeesStore().url, {
                onSuccess: () => {
                    closeForm();
                },
            });
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={onSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {selectedEmployee ? 'Edit Profil Karyawan' : 'Tambah Karyawan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEmployee
                                ? 'Perbarui informasi data diri, penugasan cabang, atau peran akses karyawan di sini.'
                                : 'Masukkan data karyawan baru beserta cabang penugasan dan hak aksesnya.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {/* Nama & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="text-sm font-semibold">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name}</span>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-sm font-semibold">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email}</span>}
                            </div>
                        </div>

                        {/* Telepon & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="phone" className="text-sm font-semibold">No. Telepon (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="0812xxxxxxxx"
                                    className={errors.phone ? 'border-red-500' : ''}
                                />
                                {errors.phone && <span className="text-xs text-red-500 font-medium">{errors.phone}</span>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="status" className="text-sm font-semibold">Status Keaktifan</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger id="status" className={errors.status ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif (Ditangguhkan)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <span className="text-xs text-red-500 font-medium">{errors.status}</span>}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="text-sm font-semibold">
                                {selectedEmployee ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Akses'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={selectedEmployee ? 'Kosongkan jika tidak ingin mengubah sandi' : 'Minimal 8 karakter'}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <span className="text-xs text-red-500 font-medium">{errors.password}</span>}
                        </div>

                        {/* Tenant Dropdown (Khusus Super Admin) */}
                        {isSuperAdmin && (
                            <div className="grid gap-1.5 border-t border-border pt-3 mt-1">
                                <Label htmlFor="tenant_id" className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    [Super Admin] Pilih Perusahaan / Tenant
                                </Label>
                                <Select
                                    value={selectedTenantId}
                                    onValueChange={handleTenantChange}
                                >
                                    <SelectTrigger id="tenant_id" className={errors.tenant_id ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder="Pilih Perusahaan / Tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant_id && <span className="text-xs text-red-500 font-medium">{errors.tenant_id}</span>}
                            </div>
                        )}

                        {/* Cabang & Peran */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="branch_id" className="text-sm font-semibold">
                                    Cabang Penugasan
                                </Label>
                                <Select
                                    value={data.branch_id}
                                    onValueChange={(val) => setData('branch_id', val)}
                                    disabled={isSuperAdmin && !selectedTenantId}
                                >
                                    <SelectTrigger id="branch_id" className={errors.branch_id ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder={isSuperAdmin && !selectedTenantId ? "Pilih Tenant dulu" : "Pilih Cabang"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredBranches.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.branch_id && <span className="text-xs text-red-500 font-medium">{errors.branch_id}</span>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="role_id" className="text-sm font-semibold">
                                    Hak Akses (Peran)
                                </Label>
                                <Select
                                    value={data.role_id}
                                    onValueChange={(val) => setData('role_id', val)}
                                >
                                    <SelectTrigger id="role_id" className={errors.role_id ? 'border-red-500 w-full' : 'w-full'}>
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles
                                            .filter(r => {
                                                if (!isSuperAdmin) {
                                                    // Tenants should not see super-admin role
                                                    if (r.name === 'super-admin') return false;
                                                    return true; 
                                                }
                                                // For Super Admin:
                                                if (r.name === 'super-admin') return true; // Always show super-admin option
                                                if (!selectedTenantId) return false; // Don't show tenant roles if no tenant selected
                                                return r.tenant_id === selectedTenantId; // Show roles for selected tenant
                                            })
                                            .reduce((unique, item) => {
                                                // Prevent duplicates by role name
                                                return unique.some(x => x.name === item.name) ? unique : [...unique, item];
                                            }, [] as any[])
                                            .map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.name.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && <span className="text-xs text-red-500 font-medium">{errors.role_id}</span>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border pt-4">
                        <Button type="button" variant="outline" onClick={closeForm}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-primary text-primary-foreground">
                            {processing ? 'Menyimpan...' : 'Simpan Karyawan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

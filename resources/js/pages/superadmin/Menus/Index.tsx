import { Head, useForm, router } from '@inertiajs/react';
import { Settings2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MenuDeleteDialog } from '@/features/superadmin/menus/components/MenuDeleteDialog';
import { MenuFormDialog } from '@/features/superadmin/menus/components/MenuFormDialog';
import { MenuTable } from '@/features/superadmin/menus/components/MenuTable';
import MainLayout from '@/layouts/app/app-main-layout';

export default function MenusPage({ menus, permissions }: { menus: any[], permissions: Record<string, any[]> }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<any>(null);

    const { data, setData, reset, errors, clearErrors, processing, post, put, delete: destroy, transform } = useForm({
        title: '', href: '', icon: '', parent_id: '', permission_key: '', order: 1
    });

    const openForm = (menu: any = null) => {
        setSelectedMenu(menu);

        if (menu) {
            setData({ title: menu.title || '', href: menu.href || '', icon: menu.icon || '', parent_id: menu.parent_id || '', permission_key: menu.permission_key || '', order: menu.order || 1 });
        } else {
            reset();
        }

        clearErrors();
        setIsFormOpen(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        const url = selectedMenu ? `/superadmin/menus/${selectedMenu.id}` : '/superadmin/menus';

        transform((currentData) => ({
            ...currentData,
            parent_id: currentData.parent_id === '__none__' || currentData.parent_id === '' ? null : currentData.parent_id,
            permission_key: currentData.permission_key === '__none__' || currentData.permission_key === '' ? null : currentData.permission_key
        }));

        const options = {
            onSuccess: () => {
                toast.success(`Menu berhasil ${selectedMenu ? 'diperbarui' : 'ditambahkan'}!`);
                setIsFormOpen(false);
            }
        };

        if (selectedMenu) {
            put(url, options);
        } else {
            post(url, options);
        }
    };

    const handleDelete = () => {
        if (selectedMenu) {
            destroy(`/superadmin/menus/${selectedMenu.id}`, {
                onSuccess: () => {
                    toast.success('Menu berhasil dihapus!');
                    setIsDeleteDialogOpen(false);
                }
            });
        }
    };

    const flatMenus = menus.flatMap(p => [{ ...p, is_child: false }, ...(p.children || []).map((c: any) => ({ ...c, is_child: true, parent_title: p.title }))]);

    return (
        <MainLayout>
            <Head title="Manajemen Menu Sistem" />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary" /> Manajemen Menu Sistem</h1>
                    <p className="text-sm text-slate-500 mt-1">Atur sidebar menu, hierarki, dan hak akses permissions.</p>
                </div>
                <Button onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" /> Tambah Menu</Button>
            </div>
            <MenuTable flatMenus={flatMenus} onEdit={openForm} onDelete={(m) => {
                setSelectedMenu(m); setIsDeleteDialogOpen(true);
            }} />
            <MenuFormDialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} data={data} setData={setData} onSubmit={submitForm} errors={errors} processing={processing} menus={menus} permissions={permissions} isEdit={!!selectedMenu} />
            <MenuDeleteDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} selectedMenu={selectedMenu} processing={processing} />
        </MainLayout>
    );
}

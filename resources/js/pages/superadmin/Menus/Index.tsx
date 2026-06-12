import { Head } from '@inertiajs/react';
import { Settings2, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { MenuDeleteDialog } from '@/features/superadmin/menus/components/MenuDeleteDialog';
import { MenuFormDialog } from '@/features/superadmin/menus/components/MenuFormDialog';
import { MenuTable } from '@/features/superadmin/menus/components/MenuTable';
import MainLayout from '@/layouts/app/app-main-layout';
import { useMenuStore } from '@/pages/superadmin/Menus/stores/useMenuStore';

export default function MenusPage({ menus, permissions }: { menus: any[], permissions: Record<string, any[]> }) {
    const { openForm } = useMenuStore();



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
            <MenuTable flatMenus={flatMenus} />
            <MenuFormDialog />
            <MenuDeleteDialog />
        </MainLayout>
    );
}

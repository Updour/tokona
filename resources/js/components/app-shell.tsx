import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
    className?: string; // Tambahkan properti opsional ini
};

export function AppShell({ children, variant = 'sidebar', className }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className={`flex min-h-screen w-full flex-col ${className || ''}`}>{children}</div>
        );
    }

    return (
        /* 
          Tambahkan flex, min-h-screen, dan w-full secara tegas pada SidebarProvider 
          bersamaan dengan properti className eksternal
        */
        <SidebarProvider defaultOpen={isOpen} className={`flex min-h-screen w-full ${className || ''}`}>
            {children}
        </SidebarProvider>
    );
}

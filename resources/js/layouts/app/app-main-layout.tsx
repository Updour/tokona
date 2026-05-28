import { type ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        /* Div sukses Anda sekarang resmi menjadi pembungkus global */
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 w-full">
            {children}
        </div>
    );
}

import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<any>();
    const isSuperAdmin = props.auth?.user?.is_super_admin;
    const tenantName = props.tenants?.[0]?.name;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-foreground">
                    {isSuperAdmin ? 'Tokona Admin' : (tenantName || 'Tokona Store')}
                </span>
                {!isSuperAdmin && (
                    <span className="text-[10px] text-muted-foreground leading-none font-medium">
                        Paket: <span className="capitalize text-primary font-bold">{props.tenants?.[0]?.plan || 'Free'}</span>
                    </span>
                )}
            </div>
        </>
    );
}

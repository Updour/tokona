import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<any>();
    const isSuperAdmin = props.auth?.user?.is_super_admin;
    const currentTenant = props.tenants?.[0]; // For non-admin, they only have 1 tenant in array
    const tenantName = currentTenant?.name;
    const logoUrl = currentTenant?.logo_url;

    return (
        <>
            <div className={`flex aspect-square size-8 items-center justify-center rounded-md ${!logoUrl || isSuperAdmin ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-transparent overflow-hidden border border-border/50 shadow-sm'}`}>
                {logoUrl && !isSuperAdmin ? (
                    <img src={logoUrl} alt={tenantName} className="size-full object-cover" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-foreground">
                    {isSuperAdmin ? 'Tokona Admin' : (tenantName || 'Tokona Store')}
                </span>
                {!isSuperAdmin && (
                    <span className="text-[10px] text-muted-foreground leading-none font-medium">
                        Paket: <span className="capitalize text-primary font-bold">{currentTenant?.plan || 'Free'}</span>
                    </span>
                )}
            </div>
        </>
    );
}

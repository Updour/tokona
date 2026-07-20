import { Link, usePage } from '@inertiajs/react';
import * as Icons from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

// Map icon strings from DB to Lucide React components
const iconMap: Record<string, React.ComponentType<any>> = {
    LayoutGrid: Icons.LayoutGrid,
    ShoppingCart: Icons.ShoppingCart,
    Package: Icons.Package,
    Receipt: Icons.Receipt,
    Users: Icons.Users,
    Megaphone: Icons.Megaphone,
    Store: Icons.Store,
    PieChart: Icons.PieChart,
    UserCircle: Icons.UserCircle,
    Building2: Icons.Building2,
    LinkIcon: Icons.Link,
    Settings: Icons.Settings,
    ShieldAlert: Icons.ShieldAlert,
    Activity: Icons.Activity,
    Navigation: Icons.Navigation,
    Smartphone: Icons.Smartphone,
};


export function AppSidebar() {
    const { props } = usePage<any>();
    const dbMenus = props.menus || [];

    // Map DB menu strings to Lucide Icon components
    const dynamicNavItems = dbMenus.map((menu: any) => {
        const IconComponent = menu.icon ? iconMap[menu.icon] : null;

        return {
            title: menu.title,
            href: menu.href,
            icon: IconComponent,
            items: menu.items || [],
        };
    });

    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const subscription = props.subscription;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={dynamicNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {!isCollapsed && subscription && (
                    <div className="px-3.5 py-3 mx-2 mb-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                subscription.plan === 'enterprise'
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                                    : subscription.plan === 'pro'
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/40'
                                    : 'bg-slate-800/60 text-slate-400 border-slate-700/40'
                            }`}>
                                Paket {subscription.plan}
                            </span>
                            <span className="text-[9px] text-slate-400">
                                {subscription.usage.branches}/{subscription.limits.branches} Cabang
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    subscription.plan === 'enterprise' ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (subscription.usage.branches / subscription.limits.branches) * 100
                                    )}%`,
                                }}
                            />
                        </div>
                        {subscription.plan !== 'enterprise' && (
                            <button
                                type="button"
                                onClick={() => {
                                    window.open(
                                        `https://wa.me/628123456789?text=Halo%20Admin%20Tokona,%20saya%20tertarik%20untuk%20upgrade%20layanan%20POS%20saya%20dari%20paket%20${subscription.plan.toUpperCase()}`,
                                        '_blank'
                                    );
                                }}
                                className="w-full text-center py-1.5 rounded text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1 transition-colors mt-2"
                            >
                                <Icons.Sparkles className="h-3 w-3" />
                                <span>Upgrade Sekarang</span>
                            </button>
                        )}
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

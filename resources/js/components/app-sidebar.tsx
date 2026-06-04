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
};

const footerNavItems: NavItem[] = [
    {
        title: 'Platform Guide',
        href: '#',
        icon: Icons.BookOpen,
    },
    {
        title: 'Settings',
        href: '#',
        icon: Icons.Settings,
    },
];

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
                    <div className="px-3.5 py-3 mx-2 mb-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-slate-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                                Paket {subscription.plan}
                            </span>
                            <span className="text-[9px] text-slate-400">
                                {subscription.usage.branches}/{subscription.limits.branches} Cabang
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (subscription.usage.branches / subscription.limits.branches) * 100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

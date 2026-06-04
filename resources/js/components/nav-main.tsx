import { Link, usePage } from '@inertiajs/react';
import lodash from 'lodash';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
const { uniqBy } = lodash;

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const uniqueItems = uniqBy(items, 'title');
    const { props } = usePage<any>();
    const lowStockCount = props.low_stock_count || 0;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {uniqueItems.map((item) => {
                    const isActive = isCurrentUrl(item.href) || item.items?.some((subItem) => isCurrentUrl(subItem.href));
                    const isInventory = ['inventori', 'inventory', 'stok'].includes(item.title.toLowerCase());
                    
                    if (item.items && item.items.length > 0) {
                        return (
                            <Collapsible key={item.title} asChild defaultOpen={isActive}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={{ children: item.title }} isActive={isActive}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            {isInventory && lowStockCount > 0 && (
                                                <span className="ml-auto mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                                                    {lowStockCount}
                                                </span>
                                            )}
                                            <ChevronRight className={`${isInventory && lowStockCount > 0 ? '' : 'ml-auto'} transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => {
                                                const isSubInventoryLow = subItem.href === '/inventory/low-stock' || 
                                                    subItem.title.toLowerCase().includes('kritis') || 
                                                    subItem.title.toLowerCase().includes('low stock');

                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={isCurrentUrl(subItem.href)}>
                                                            <Link href={subItem.href} prefetch>
                                                                <span className="flex items-center justify-between w-full">
                                                                    <span>{subItem.title}</span>
                                                                    {isSubInventoryLow && lowStockCount > 0 && (
                                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                                                                            {lowStockCount}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {isInventory && lowStockCount > 0 && (
                                        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                                            {lowStockCount}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

import { Link } from '@inertiajs/react';
import { LayoutGrid, ShoppingCart, Package, Receipt, Users, FolderGit2, BookOpen, Store, PieChart, Megaphone, UserCircle, Building2, Link as LinkIcon, Settings, ShieldAlert } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        items: [
            { title: 'Overview', href: dashboard() },
            { title: 'Grafik penjualan', href: '#' },
            { title: 'Top produk', href: '#' },
            { title: 'Aktivitas terbaru', href: '#' },
        ],
    },
    {
        title: 'Penjualan (POS)',
        href: '/pos',
        icon: ShoppingCart,
        items: [
            { title: 'Kasir', href: '/pos' },
            { title: 'Daftar transaksi', href: '/pos?tab=transactions' },
            { title: 'Retur penjualan', href: '/pos?tab=returns' },
            { title: 'Draft / pending order', href: '/pos?tab=drafts' },
        ],
    },
    {
        title: 'Produk',
        href: '/products',
        icon: Package,
        items: [
            { title: 'Semua Produk', href: '/products' },
            { title: 'Kategori Produk', href: '/product-categories' },
            { title: 'Tipe Produk', href: '/product-types' },
            { title: 'Stok & Inventori', href: '/inventory' },
            { title: 'Harga & Diskon', href: '/products/pricing' },
        ],
    },
    {
        title: 'Pelanggan (CRM)',
        href: '/customers',
        icon: Users,
        items: [
            { title: 'Daftar Pelanggan', href: '/customers' },
            { title: 'Tier & Membership', href: '/membership' },
        ],
    },
    {
        title: 'Marketing',
        href: '/promos',
        icon: Megaphone,
        items: [
            { title: 'Diskon & Promo', href: '/promos' },
            { title: 'Voucher Pelanggan', href: '/vouchers' },
        ],
    },
    {
        title: 'Pembelian',
        href: '/purchases',
        icon: Store,
        items: [
            { title: 'Semua Pembelian', href: '/purchases' },
            { title: 'Data Supplier', href: '/suppliers' },
            { title: 'Retur Pembelian', href: '/purchase-returns' },
            { title: 'Hutang Pemasok', href: '/purchases?status=received' },
        ],
    },
    {
        title: 'Keuangan',
        href: '#',
        icon: Receipt,
        items: [
            { title: 'Pemasukan', href: '/incomes' },
            { title: 'Pengeluaran', href: '/expenses' },
            { title: 'Laporan laba rugi', href: '/profit-loss' },
            { title: 'Laporan akuntansi', href: '/accounting/reports' },
            { title: 'Kas & saldo', href: '/cash-books' },
            { title: 'Hutang & piutang', href: '/debts-receivables' },
        ],
    },
    {
        title: 'Laporan',
        href: '/business/reports',
        icon: PieChart,
        items: [
            { title: 'Laporan penjualan', href: '/business/reports?tab=sales' },
            { title: 'Laporan produk', href: '/business/reports?tab=products' },
            { title: 'Laporan stok', href: '/business/reports?tab=stock' },
            { title: 'Laporan keuangan', href: '/accounting/reports' },
        ],
    },
    {
        title: 'Karyawan',
        href: '#',
        icon: UserCircle,
        items: [
            { title: 'Daftar karyawan', href: '#' },
            { title: 'Role & permission', href: '#' },
            { title: 'Shift kerja', href: '#' },
        ],
    },
    {
        title: 'Toko',
        href: '#',
        icon: Building2,
        items: [
            { title: 'Data toko', href: '/tenants' },
            { title: 'Cabang', href: '/branches' },
            { title: 'Manajemen gudang', href: '#' },
        ],
    },
    {
        title: 'Integrasi',
        href: '#',
        icon: LinkIcon,
        items: [
            { title: 'Shopee / Tokopedia', href: '#' },
            { title: 'Payment gateway', href: '#' },
            { title: 'Printer / device kasir', href: '#' },
        ],
    },
    {
        title: 'Pengaturan',
        href: '#',
        icon: Settings,
        items: [
            { title: 'Profil bisnis', href: '#' },
            { title: 'Pengaturan pajak', href: '#' },
            { title: 'Metode pembayaran', href: '#' },
            { title: 'Template struk', href: '#' },
            { title: 'API key / webhook', href: '#' },
        ],
    },
    {
        title: 'Super Admin',
        href: '#',
        icon: ShieldAlert,
        items: [
            { title: 'Manajemen user', href: '/users' },
            { title: 'Subscription / paket', href: '/tenants' },
            { title: 'Billing', href: '/tenants' },
            { title: 'Monitoring toko', href: '/tenants' },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

import { usePage } from '@inertiajs/react';

export function AppSidebar() {
    const { props } = usePage<any>();
    const isSuperAdmin = props.auth?.user?.is_super_admin;

    const filteredNavItems = mainNavItems.filter((item) => {
        if (item.title === 'Super Admin') {
            return isSuperAdmin;
        }
        return true;
    });

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
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

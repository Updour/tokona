<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. SEED ALL PERMISSIONS ──────────────────────────────────────────
        $permissions = [
            // Super Admin
            ['key' => 'superadmin.access', 'name' => 'Akses Super Admin', 'module' => 'Super Admin'],
            
            // POS
            ['key' => 'pos.index', 'name' => 'Akses Kasir POS', 'module' => 'Penjualan (POS)'],
            
            // Produk
            ['key' => 'products.index', 'name' => 'Lihat Produk', 'module' => 'Produk'],
            ['key' => 'products.create', 'name' => 'Tambah Produk', 'module' => 'Produk'],
            ['key' => 'products.update', 'name' => 'Edit Produk', 'module' => 'Produk'],
            ['key' => 'products.delete', 'name' => 'Hapus Produk', 'module' => 'Produk'],
            
            // Kategori & Tipe
            ['key' => 'categories.index', 'name' => 'Akses Kategori', 'module' => 'Produk'],
            ['key' => 'types.index', 'name' => 'Akses Tipe Produk', 'module' => 'Produk'],
            ['key' => 'inventory.index', 'name' => 'Akses Stok & Inventori', 'module' => 'Produk'],

            // Pelanggan (CRM)
            ['key' => 'customers.index', 'name' => 'Akses Pelanggan', 'module' => 'CRM'],
            ['key' => 'membership.index', 'name' => 'Akses Tier & Membership', 'module' => 'CRM'],
            
            // Marketing
            ['key' => 'promos.index', 'name' => 'Akses Diskon & Promo', 'module' => 'Marketing'],
            ['key' => 'vouchers.index', 'name' => 'Akses Voucher', 'module' => 'Marketing'],

            // Pembelian & Supplier
            ['key' => 'purchases.index', 'name' => 'Akses Pembelian', 'module' => 'Pembelian'],
            ['key' => 'suppliers.index', 'name' => 'Akses Supplier', 'module' => 'Pembelian'],
            
            // Keuangan
            ['key' => 'finance.index', 'name' => 'Akses Keuangan', 'module' => 'Keuangan'],
            
            // Laporan
            ['key' => 'reports.index', 'name' => 'Akses Laporan Bisnis', 'module' => 'Laporan'],

            // Karyawan
            ['key' => 'users.index', 'name' => 'Akses Karyawan & User', 'module' => 'Karyawan'],
            ['key' => 'roles.index', 'name' => 'Akses Role & Permission', 'module' => 'Karyawan'],

            // Toko / Tenant
            ['key' => 'tenants.index', 'name' => 'Akses Toko & Tenant', 'module' => 'Toko'],
            ['key' => 'branches.index', 'name' => 'Akses Cabang Toko', 'module' => 'Toko'],
        ];

        $permissionIds = [];
        foreach ($permissions as $p) {
            $existing = DB::table('permissions')->where('key', $p['key'])->first();
            if ($existing) {
                $permissionIds[$p['key']] = $existing->id;
            } else {
                $id = Illuminate\Support\Str::uuid()->toString();
                DB::table('permissions')->insert([
                    'id' => $id,
                    'key' => $p['key'],
                    'name' => $p['name'],
                    'module' => $p['module'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $permissionIds[$p['key']] = $id;
            }
        }

        // ── 2. SEED ROLES ────────────────────────────────────────────────────
        $tenants = DB::table('tenants')->get();
        
        $rolesToCreate = [
            'super-admin' => 'Super Administrator Sistem',
            'owner'       => 'Pemilik Usaha / Tenant',
            'admin'       => 'Administrator Toko',
            'cashier'     => 'Kasir POS Toko',
        ];

        // Buat roles untuk setiap tenant yang ada
        foreach ($tenants as $t) {
            foreach ($rolesToCreate as $rName => $rDesc) {
                $existingRole = DB::table('roles')
                    ->where('tenant_id', $t->id)
                    ->where('name', $rName)
                    ->first();

                if (!$existingRole) {
                    $roleId = Illuminate\Support\Str::uuid()->toString();
                    DB::table('roles')->insert([
                        'id' => $roleId,
                        'tenant_id' => $t->id,
                        'name' => $rName,
                        'description' => $rDesc,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Khusus super-admin, jika tidak ada role global (tenant_id apa saja atau first tenant)
        // Kita cari atau buat role super-admin yang dikaitkan dengan tenant pertama jika ada
        $firstTenant = $tenants->first();
        $superAdminRoleId = null;
        if ($firstTenant) {
            $superAdminRole = DB::table('roles')
                ->where('tenant_id', $firstTenant->id)
                ->where('name', 'super-admin')
                ->first();
            if ($superAdminRole) {
                $superAdminRoleId = $superAdminRole->id;
            }
        }

        // Jika user superadmin@tokona.com ada, pastikan terhubung ke role super-admin
        $superadminUser = DB::table('users')->where('email', 'superadmin@tokona.com')->first();
        if ($superadminUser && $superAdminRoleId) {
            $linked = DB::table('user_roles')
                ->where('user_id', $superadminUser->id)
                ->where('role_id', $superAdminRoleId)
                ->exists();
            if (!$linked) {
                DB::table('user_roles')->insert([
                    'user_id' => $superadminUser->id,
                    'role_id' => $superAdminRoleId
                ]);
            }
        }

        // Hubungkan permissions ke roles yang ada
        $allRoles = DB::table('roles')->get();
        foreach ($allRoles as $role) {
            if ($role->name === 'super-admin') {
                foreach ($permissionIds as $pKey => $pId) {
                    $exists = DB::table('role_permissions')
                        ->where('role_id', $role->id)
                        ->where('permission_id', $pId)
                        ->exists();
                    if (!$exists) {
                        DB::table('role_permissions')->insert([
                            'role_id' => $role->id,
                            'permission_id' => $pId,
                        ]);
                    }
                }
            } elseif ($role->name === 'owner') {
                foreach ($permissionIds as $pKey => $pId) {
                    if ($pKey !== 'superadmin.access') {
                        $exists = DB::table('role_permissions')
                            ->where('role_id', $role->id)
                            ->where('permission_id', $pId)
                            ->exists();
                        if (!$exists) {
                            DB::table('role_permissions')->insert([
                                'role_id' => $role->id,
                                'permission_id' => $pId,
                            ]);
                        }
                    }
                }
            } elseif ($role->name === 'admin') {
                $adminPermissions = [
                    'pos.index', 'products.index', 'products.create', 'products.update',
                    'categories.index', 'types.index', 'inventory.index', 'customers.index',
                    'membership.index', 'promos.index', 'vouchers.index', 'purchases.index',
                    'suppliers.index', 'finance.index', 'reports.index', 'users.index', 'branches.index'
                ];
                foreach ($adminPermissions as $pKey) {
                    if (isset($permissionIds[$pKey])) {
                        $exists = DB::table('role_permissions')
                            ->where('role_id', $role->id)
                            ->where('permission_id', $permissionIds[$pKey])
                            ->exists();
                        if (!$exists) {
                            DB::table('role_permissions')->insert([
                                'role_id' => $role->id,
                                'permission_id' => $permissionIds[$pKey],
                            ]);
                        }
                    }
                }
            } elseif ($role->name === 'cashier') {
                $cashierPermissions = ['pos.index', 'products.index', 'customers.index'];
                foreach ($cashierPermissions as $pKey) {
                    if (isset($permissionIds[$pKey])) {
                        $exists = DB::table('role_permissions')
                            ->where('role_id', $role->id)
                            ->where('permission_id', $permissionIds[$pKey])
                            ->exists();
                        if (!$exists) {
                            DB::table('role_permissions')->insert([
                                'role_id' => $role->id,
                                'permission_id' => $permissionIds[$pKey],
                            ]);
                        }
                    }
                }
            }
        }

        // ── 3. SEED DYNAMIC MENUS ───────────────────────────────────────────
        DB::table('menus')->delete(); // menus is safe to truncate since it's brand new

        $menus = [
            // Parent: Dashboard
            [
                'title' => 'Dashboard',
                'href' => '/dashboard',
                'icon' => 'LayoutGrid',
                'permission_key' => null,
                'order' => 1,
                'children' => [
                    ['title' => 'Overview', 'href' => '/dashboard', 'permission_key' => null, 'order' => 1],
                    ['title' => 'Grafik penjualan', 'href' => '#', 'permission_key' => 'reports.index', 'order' => 2],
                    ['title' => 'Top produk', 'href' => '#', 'permission_key' => 'reports.index', 'order' => 3],
                ]
            ],
            // Parent: POS
            [
                'title' => 'Penjualan (POS)',
                'href' => '/pos',
                'icon' => 'ShoppingCart',
                'permission_key' => 'pos.index',
                'order' => 2,
                'children' => [
                    ['title' => 'Kasir', 'href' => '/pos', 'permission_key' => 'pos.index', 'order' => 1],
                    ['title' => 'Daftar transaksi', 'href' => '/pos?tab=transactions', 'permission_key' => 'pos.index', 'order' => 2],
                    ['title' => 'Retur penjualan', 'href' => '/pos?tab=returns', 'permission_key' => 'pos.index', 'order' => 3],
                ]
            ],
            // Parent: Produk
            [
                'title' => 'Produk',
                'href' => '/products',
                'icon' => 'Package',
                'permission_key' => 'products.index',
                'order' => 3,
                'children' => [
                    ['title' => 'Semua Produk', 'href' => '/products', 'permission_key' => 'products.index', 'order' => 1],
                    ['title' => 'Kategori Produk', 'href' => '/product-categories', 'permission_key' => 'categories.index', 'order' => 2],
                    ['title' => 'Tipe Produk', 'href' => '/product-types', 'permission_key' => 'types.index', 'order' => 3],
                    ['title' => 'Stok & Inventori', 'href' => '/inventory', 'permission_key' => 'inventory.index', 'order' => 4],
                ]
            ],
            // Parent: CRM
            [
                'title' => 'Pelanggan (CRM)',
                'href' => '/customers',
                'icon' => 'Users',
                'permission_key' => 'customers.index',
                'order' => 4,
                'children' => [
                    ['title' => 'Daftar Pelanggan', 'href' => '/customers', 'permission_key' => 'customers.index', 'order' => 1],
                    ['title' => 'Tier & Membership', 'href' => '/membership', 'permission_key' => 'membership.index', 'order' => 2],
                ]
            ],
            // Parent: Marketing
            [
                'title' => 'Marketing',
                'href' => '/promos',
                'icon' => 'Megaphone',
                'permission_key' => 'promos.index',
                'order' => 5,
                'children' => [
                    ['title' => 'Diskon & Promo', 'href' => '/promos', 'permission_key' => 'promos.index', 'order' => 1],
                    ['title' => 'Voucher Pelanggan', 'href' => '/vouchers', 'permission_key' => 'vouchers.index', 'order' => 2],
                ]
            ],
            // Parent: Pembelian
            [
                'title' => 'Pembelian',
                'href' => '/purchases',
                'icon' => 'Store',
                'permission_key' => 'purchases.index',
                'order' => 6,
                'children' => [
                    ['title' => 'Semua Pembelian', 'href' => '/purchases', 'permission_key' => 'purchases.index', 'order' => 1],
                    ['title' => 'Data Supplier', 'href' => '/suppliers', 'permission_key' => 'suppliers.index', 'order' => 2],
                ]
            ],
            // Parent: Keuangan
            [
                'title' => 'Keuangan',
                'href' => '#',
                'icon' => 'Receipt',
                'permission_key' => 'finance.index',
                'order' => 7,
                'children' => [
                    ['title' => 'Pemasukan', 'href' => '/incomes', 'permission_key' => 'finance.index', 'order' => 1],
                    ['title' => 'Pengeluaran', 'href' => '/expenses', 'permission_key' => 'finance.index', 'order' => 2],
                    ['title' => 'Laporan laba rugi', 'href' => '/profit-loss', 'permission_key' => 'finance.index', 'order' => 3],
                    ['title' => 'Kas & saldo', 'href' => '/cash-books', 'permission_key' => 'finance.index', 'order' => 4],
                ]
            ],
            // Parent: Laporan
            [
                'title' => 'Laporan',
                'href' => '/business/reports',
                'icon' => 'PieChart',
                'permission_key' => 'reports.index',
                'order' => 8,
                'children' => [
                    ['title' => 'Laporan penjualan', 'href' => '/business/reports?tab=sales', 'permission_key' => 'reports.index', 'order' => 1],
                    ['title' => 'Laporan produk', 'href' => '/business/reports?tab=products', 'permission_key' => 'reports.index', 'order' => 2],
                    ['title' => 'Laporan stok', 'href' => '/business/reports?tab=stock', 'permission_key' => 'reports.index', 'order' => 3],
                ]
            ],
            // Parent: Karyawan
            [
                'title' => 'Karyawan',
                'href' => '#',
                'icon' => 'UserCircle',
                'permission_key' => 'users.index',
                'order' => 9,
                'children' => [
                    ['title' => 'Daftar karyawan', 'href' => '/users', 'permission_key' => 'users.index', 'order' => 1],
                    ['title' => 'Role & permission', 'href' => '#', 'permission_key' => 'roles.index', 'order' => 2],
                ]
            ],
            // Parent: Toko
            [
                'title' => 'Toko',
                'href' => '#',
                'icon' => 'Building2',
                'permission_key' => 'tenants.index',
                'order' => 10,
                'children' => [
                    ['title' => 'Data toko', 'href' => '/tenants', 'permission_key' => 'tenants.index', 'order' => 1],
                    ['title' => 'Cabang', 'href' => '/branches', 'permission_key' => 'branches.index', 'order' => 2],
                ]
            ],
            // Parent: Super Admin
            [
                'title' => 'Super Admin',
                'href' => '#',
                'icon' => 'ShieldAlert',
                'permission_key' => 'superadmin.access',
                'order' => 11,
                'children' => [
                    ['title' => 'Manajemen user', 'href' => '/users', 'permission_key' => 'superadmin.access', 'order' => 1],
                    ['title' => 'Subscription / paket', 'href' => '/tenants', 'permission_key' => 'superadmin.access', 'order' => 2],
                    ['title' => 'Billing', 'href' => '/tenants', 'permission_key' => 'superadmin.access', 'order' => 3],
                    ['title' => 'Monitoring toko', 'href' => '/tenants', 'permission_key' => 'superadmin.access', 'order' => 4],
                ]
            ],
        ];

        // Seed Parent & Child menus
        foreach ($menus as $m) {
            $parentId = Illuminate\Support\Str::uuid()->toString();
            DB::table('menus')->insert([
                'id' => $parentId,
                'parent_id' => null,
                'title' => $m['title'],
                'href' => $m['href'],
                'icon' => $m['icon'],
                'permission_key' => $m['permission_key'],
                'order' => $m['order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (isset($m['children'])) {
                foreach ($m['children'] as $child) {
                    DB::table('menus')->insert([
                        'id' => Illuminate\Support\Str::uuid()->toString(),
                        'parent_id' => $parentId,
                        'title' => $child['title'],
                        'href' => $child['href'],
                        'icon' => null,
                        'permission_key' => $child['permission_key'],
                        'order' => $child['order'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menus')->truncate();
    }
};

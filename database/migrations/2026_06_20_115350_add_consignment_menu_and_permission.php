<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah Permission
        $permissionId = Str::uuid()->toString();
        DB::table('permissions')->insert([
            'id' => $permissionId,
            'key' => 'consignments.index',
            'name' => 'Akses Konsinyasi',
            'module' => 'Pembelian',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Hubungkan permission ke Roles (super-admin, owner, admin)
        $roles = DB::table('roles')->whereIn('name', ['super-admin', 'owner', 'admin'])->get();
        foreach ($roles as $role) {
            DB::table('role_permissions')->insert([
                'role_id' => $role->id,
                'permission_id' => $permissionId,
            ]);
        }

        // 3. Tambah Menu di bawah Parent "Pembelian"
        $parentMenu = DB::table('menus')->where('title', 'Pembelian')->whereNull('parent_id')->first();
        if ($parentMenu) {
            DB::table('menus')->insert([
                'id' => Str::uuid()->toString(),
                'parent_id' => $parentMenu->id,
                'title' => 'Barang Titipan',
                'href' => '/consignments',
                'icon' => null,
                'permission_key' => 'consignments.index',
                'order' => 3, // Set setelah Data Supplier
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus Menu
        DB::table('menus')->where('href', '/consignments')->delete();

        // Hapus Permission dan kaitannya
        $permission = DB::table('permissions')->where('key', 'consignments.index')->first();
        if ($permission) {
            DB::table('role_permissions')->where('permission_id', $permission->id)->delete();
            DB::table('permissions')->where('id', $permission->id)->delete();
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $hrisMenu = DB::table('menus')->where('title', 'HRIS')->first();

        if ($hrisMenu) {
            DB::table('menus')->insert([
                'id' => Str::uuid()->toString(),
                'parent_id' => $hrisMenu->id,
                'title' => 'Kasbon (Pinjaman)',
                'href' => '/hris/cash-advances',
                'icon' => null,
                'permission_key' => 'view cash advances',
                'order' => 4,
            ]);

            DB::table('permissions')->insert([
                ['id' => Str::uuid()->toString(), 'name' => 'view cash advances', 'guard_name' => 'web'],
                ['id' => Str::uuid()->toString(), 'name' => 'create cash advances', 'guard_name' => 'web'],
                ['id' => Str::uuid()->toString(), 'name' => 'delete cash advances', 'guard_name' => 'web'],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menus')->where('title', 'Kasbon (Pinjaman)')->delete();
        DB::table('permissions')->whereIn('name', [
            'view cash advances',
            'create cash advances',
            'delete cash advances'
        ])->delete();
    }
};

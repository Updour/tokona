<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('menus')
            ->where('title', 'Billing')
            ->where('permission_key', 'superadmin.access')
            ->update(['href' => '/superadmin/billing']);

        DB::table('menus')
            ->where('title', 'Monitoring toko')
            ->where('permission_key', 'superadmin.access')
            ->update(['href' => '/superadmin/monitoring']);
    }

    public function down(): void
    {
        DB::table('menus')
            ->where('title', 'Billing')
            ->where('permission_key', 'superadmin.access')
            ->update(['href' => '/tenants']);

        DB::table('menus')
            ->where('title', 'Monitoring toko')
            ->where('permission_key', 'superadmin.access')
            ->update(['href' => '/tenants']);
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = DB::table('tenants')->first();

        $roles = [
            'owner',
            'admin',
            'cashier'
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'name' => $role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

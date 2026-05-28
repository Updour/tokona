<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenanLocationSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            DB::table('tenant_locations')->insert([
                'id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenant->id,
                'latitude' => -6.200000,
                'longitude' => 106.816666,
                'address_text' => 'Alamat toko ' . $tenant->name,
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'maps_link' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use \Illuminate\Support\Str;

class TenantMediaSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            $exists = DB::table('tenant_media')->where('tenant_id', $tenant->id)->exists();
            if (!$exists) {
                DB::table('tenant_media')->insert([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'type' => 'store_photo',
                    'file_url' => 'https://via.placeholder.com/300',
                    'description' => 'Foto toko',
                    'uploaded_by' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
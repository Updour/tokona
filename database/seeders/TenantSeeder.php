<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Kopi Kita',
                'slug' => 'kopi-kita',
                'email' => 'kopi@tokona.com',
                'phone' => '081234567890',
                'logo' => null,
                'address' => 'Jl. Kopi No. 1',
                'status' => 'active',
                'plan' => 'pro',
                'expires_at' => now()->addDays(365),
            ],
            [
                'name' => 'Sembako Barokah',
                'slug' => 'sembako-barokah',
                'email' => 'sembako@tokona.com',
                'phone' => '082233445566',
                'logo' => null,
                'address' => 'Jl. Pasar No. 10',
                'status' => 'trial',
                'plan' => 'free',
                'expires_at' => now()->addDays(30),
            ]
        ];

        foreach ($tenants as $t) {
            $existing = DB::table('tenants')->where('slug', $t['slug'])->first();
            if (!$existing) {
                DB::table('tenants')->insert(array_merge([
                    'id' => Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ], $t));
            }
        }
    }
}
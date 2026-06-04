<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UsersTableSeeder::class);
        $this->call(tenantSeeder::class);
        $this->call(TenanLocationSeeder::class);
        $this->call(TenantMediaSeeder::class);
        $this->call(MenuAndPermissionSeeder::class);
        $this->call(SalesFieldSeeder::class);
    }
}

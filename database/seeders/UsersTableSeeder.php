<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Import facade Hash bawaan Laravel

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->delete();

        DB::table('users')->insert([
            [
                'id' => '019e445c-c0c5-7074-b147-eb856272f55d',
                'name' => 'Super Admin Tokona',
                'email' => 'superadmin@tokona.com',
                'email_verified_at' => null,
                'password' => Hash::make('password'),
                'tenant_id' => '019e445c-bf8a-7126-9914-ced41aac8299',
                'branch_id' => '019e445c-bfb7-70d1-8333-c5df0c7b82b0',
                'phone' => null,
                'avatar' => null,
                'status' => 'active',
                'last_login_at' => null,
                'remember_token' => null,
                'created_at' => '2026-05-20 07:49:49',
                'updated_at' => '2026-05-20 07:49:49',
            ],
        ]);
    }
}

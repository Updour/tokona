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
                'tenant_id' => null,
                'branch_id' => null,
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

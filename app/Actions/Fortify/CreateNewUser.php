<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\Tenants;
use App\Models\Branch;
use App\Models\Role;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'shop_name' => ['required', 'string', 'max:100'],
            'branch_name' => ['nullable', 'string', 'max:100'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            // 1. Buat Tenant Baru
            $tenant = Tenants::create([
                'name' => $input['shop_name'],
                'status' => 'active',
                'plan' => 'free',
            ]);

            // 2. Buat Default Roles untuk Tenant Baru
            $ownerRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'owner',
                'description' => 'Pemilik Toko (Akses Penuh)',
            ]);

            Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'admin',
                'description' => 'Administrator Toko',
            ]);

            Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'cashier',
                'description' => 'Staff Kasir Toko',
            ]);

            Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'sales',
                'description' => 'Sales Lapangan / Canvas',
            ]);

            // 3. Buat Cabang Utama Baru
            $branchName = !empty($input['branch_name']) ? $input['branch_name'] : 'Pusat';
            
            // Singkatan Nama Tenant & Cabang untuk kode unik
            $tenantAbbr = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $tenant->name), 0, 3));
            $branchAbbr = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $branchName), 0, 3));
            if (strlen($tenantAbbr) < 2) $tenantAbbr = 'TKN';
            if (strlen($branchAbbr) < 2) $branchAbbr = 'CBG';
            $randomNum = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $branchCode = "{$tenantAbbr}_{$branchAbbr}{$randomNum}";

            $branch = Branch::create([
                'tenant_id' => $tenant->id,
                'name' => $branchName,
                'code' => $branchCode,
                'is_main' => true,
                'pos_settings' => [
                    'taxEnabled' => true,
                    'taxRate' => 11,
                    'activeMethods' => [
                        'cash' => true,
                        'transfer' => true,
                        'debt' => true
                    ],
                    'roundingNearest' => 100,
                    'roundingMethod' => 'floor'
                ]
            ]);

            // 4. Buat Pengguna Owner Baru
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
                'tenant_id' => $tenant->id,
                'branch_id' => $branch->id,
                'status' => 'active',
            ]);

            // 5. Hubungkan Owner dengan Role 'owner'
            $user->roles()->sync([$ownerRole->id]);

            return $user;
        });
    }
}

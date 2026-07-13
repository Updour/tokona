<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;

class categorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = DB::table('tenants')->first();
        if (!$tenant) {
            return;
        }

        $categories = [
            'Minuman',
            'Makanan',
            'Snack',
        ];

        foreach ($categories as $cat) {
            ProductCategory::firstOrCreate([
                'tenant_id' => $tenant->id,
                'name' => $cat,
            ]);
        }
    }
}

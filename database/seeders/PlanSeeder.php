<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'FREE TRIAL',
                'slug' => 'free',
                'description' => 'Paket dasar untuk uji coba platform',
                'price' => 0,
                'max_branches' => 1,
                'max_users' => 3,
                'max_products' => 50,
                'features' => json_encode([
                    'Point of Sale (Kasir)',
                    'Manajemen Stok Dasar'
                ]),
            ],
            [
                'name' => 'PRO TIER',
                'slug' => 'pro',
                'description' => 'Untuk bisnis menengah yang sedang berkembang',
                'price' => 299000,
                'max_branches' => 5,
                'max_users' => 15,
                'max_products' => 1000,
                'features' => json_encode([
                    'Point of Sale (Kasir)',
                    'Manajemen Multi Gudang',
                    'Laporan Keuangan',
                    'Fitur Promo & Diskon'
                ]),
            ],
            [
                'name' => 'ENTERPRISE',
                'slug' => 'enterprise',
                'description' => 'Solusi lengkap tanpa batas untuk bisnis besar',
                'price' => 999000,
                'max_branches' => 999999,
                'max_users' => 999999,
                'max_products' => 999999,
                'features' => json_encode([
                    'Point of Sale (Kasir)',
                    'Sistem HRIS & Penggajian',
                    'Sistem Field Sales',
                    'Akuntansi & Jurnal Lengkap',
                    'Akses Semua Fitur'
                ]),
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}

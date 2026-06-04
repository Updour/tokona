<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesFieldSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan data lama jika ada
        DB::table('sales_order_items')->delete();
        DB::table('sales_orders')->delete();
        DB::table('sales_visits')->delete();
        DB::table('sales_loaded_stocks')->delete();
        DB::table('sales_people')->delete();

        // 1. Ambil tenant dan branch pertama
        $tenant = DB::table('tenants')->first();
        $branch = DB::table('branches')->first();

        if (!$tenant || !$branch) {
            return;
        }

        $tenantId = $tenant->id;
        $branchId = $branch->id;

        // 2. Seed Sales People
        $sales1Id = Str::uuid()->toString();
        $sales2Id = Str::uuid()->toString();

        DB::table('sales_people')->insert([
            [
                'id' => $sales1Id,
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'name' => 'Budi Santoso',
                'phone' => '081234567890',
                'email' => 'budi.santoso@tokona.com',
                'commission_type' => 'percent',
                'commission_value' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $sales2Id,
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'name' => 'Siti Aminah',
                'phone' => '081298765432',
                'email' => 'siti.aminah@tokona.com',
                'commission_type' => 'fixed',
                'commission_value' => 50000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Seed Customers (Warung/Toko lain dengan lokasi koordinat valid untuk Map!)
        $cust1Id = Str::uuid()->toString();
        $cust2Id = Str::uuid()->toString();

        // Bersihkan customer dummy jika ada
        DB::table('customers')->delete();

        DB::table('customers')->insert([
            [
                'id' => $cust1Id,
                'tenant_id' => $tenantId,
                'name' => 'Toko Kelontong Jaya',
                'email' => 'jaya@toko.com',
                'phone' => '08987654321',
                'address' => 'Jl. Merdeka No. 45, Jakarta',
                'tier' => 'regular',
                'points' => 120,
                'debt_balance' => 0,
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $cust2Id,
                'tenant_id' => $tenantId,
                'name' => 'Warung Pojok Bu Sri',
                'email' => 'sri@warung.com',
                'phone' => '08877665544',
                'address' => 'Jl. Sudirman No. 12, Jakarta',
                'tier' => 'member',
                'points' => 450,
                'debt_balance' => 150000,
                'latitude' => -6.2100,
                'longitude' => 106.8500,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Ambil beberapa produk untuk di-load ke motor sales canvas
        $product = DB::table('products')->first();
        if ($product) {
            // Seed loaded stocks
            DB::table('sales_loaded_stocks')->insert([
                [
                    'id' => Str::uuid()->toString(),
                    'sales_person_id' => $sales1Id,
                    'product_id' => $product->id,
                    'allocated_qty' => 50,
                    'sold_qty' => 20,
                    'current_stock' => 30,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => Str::uuid()->toString(),
                    'sales_person_id' => $sales2Id,
                    'product_id' => $product->id,
                    'allocated_qty' => 40,
                    'sold_qty' => 15,
                    'current_stock' => 25,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // 5. Seed Sales Visits
            $visit1Id = Str::uuid()->toString();
            $visit2Id = Str::uuid()->toString();

            DB::table('sales_visits')->insert([
                [
                    'id' => $visit1Id,
                    'tenant_id' => $tenantId,
                    'sales_id' => $sales1Id,
                    'branch_id' => $branchId,
                    'customer_id' => $cust1Id,
                    'visited_at' => now()->subHours(2),
                    'latitude' => -6.2088,
                    'longitude' => 106.8456,
                    'address_text' => 'Jl. Merdeka No. 45, Jakarta',
                    'photo_url' => null,
                    'notes' => 'Pemesanan 5 dus mie instan & 2 dus minyak goreng.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => $visit2Id,
                    'tenant_id' => $tenantId,
                    'sales_id' => $sales2Id,
                    'branch_id' => $branchId,
                    'customer_id' => $cust2Id,
                    'visited_at' => now()->subHours(4),
                    'latitude' => -6.2100,
                    'longitude' => 106.8500,
                    'address_text' => 'Jl. Sudirman No. 12, Jakarta',
                    'photo_url' => null,
                    'notes' => 'Toko sedang sepi, follow up minggu depan.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // 6. Seed Sales Orders
            $orderId = Str::uuid()->toString();
            DB::table('sales_orders')->insert([
                [
                    'id' => $orderId,
                    'sales_visit_id' => $visit1Id,
                    'total_amount' => 150000.00,
                    'payment_status' => 'paid',
                    'payment_method' => 'cash',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            // Seed order items
            DB::table('sales_order_items')->insert([
                [
                    'id' => Str::uuid()->toString(),
                    'sales_order_id' => $orderId,
                    'product_id' => $product->id,
                    'qty' => 5,
                    'price' => $product->sell_price,
                    'subtotal' => 5 * $product->sell_price,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }
}

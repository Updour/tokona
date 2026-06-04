<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Sales Loaded Stocks (Stok barang yang dibawa sales di motor/mobil canvas dari toko kita)
        Schema::create('sales_loaded_stocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sales_person_id')->index(); // Referensi ke sales_people
            $table->uuid('product_id')->index();
            $table->integer('allocated_qty')->default(0); // Jumlah awal yang dibawa dari gudang
            $table->integer('sold_qty')->default(0);      // Jumlah yang laku disetorkan ke warung
            $table->integer('current_stock')->default(0);  // Sisa stok di kendaraan (allocated - sold)
            $table->timestamps();

            $table->foreign('sales_person_id')->references('id')->on('sales_people')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        // 2. Sales Orders (Pesanan/Penjualan Canvas di Lapangan ke Warung/Toko Lain)
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sales_visit_id')->index();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('payment_status')->default('paid'); // paid, unpaid
            $table->string('payment_method')->default('cash'); // cash, debt
            $table->timestamps();

            $table->foreign('sales_visit_id')->references('id')->on('sales_visits')->onDelete('cascade');
        });

        // 3. Sales Order Items
        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sales_order_id')->index();
            $table->uuid('product_id')->index();
            $table->integer('qty');
            $table->decimal('price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();

            $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_order_items');
        Schema::dropIfExists('sales_orders');
        Schema::dropIfExists('sales_loaded_stocks');
    }
};
